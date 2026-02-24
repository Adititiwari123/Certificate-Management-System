const { v4: uuidv4 } = require("uuid");

function generateCertificateId() {
  const randomPart = uuidv4().slice(0, 6).toUpperCase();
  return `CERT-2026-${randomPart}`;
}

module.exports = { generateCertificateId };


//qr code generator
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

async function generateQRCode(certificateId) {
  const verifyUrl = `http://localhost:3000/verify/${certificateId}`;
  const qrPath = path.join(__dirname, "../qrcodes", `${certificateId}.png`);

  await QRCode.toFile(qrPath, verifyUrl);

  return qrPath;
}


//pdf generator
const PDFDocument = require("pdfkit");

async function generatePDF(candidateData, certificateId, qrPath) {
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, "../certificates", `${certificateId}.pdf`);

  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  doc.fontSize(26).text("Certificate of Achievement", { align: "center" });
  doc.moveDown();

  doc.fontSize(18).text(`This is to certify that`, { align: "center" });
  doc.moveDown();

  doc.fontSize(22).text(candidateData.name, { align: "center" });
  doc.moveDown();

  doc.fontSize(16).text(`Date: ${candidateData.date}`, { align: "center" });
  doc.text(`Grade: ${candidateData.grade}`, { align: "center" });
  doc.moveDown();

  doc.image(qrPath, { fit: [100, 100], align: "center" });

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => {
      resolve(pdfPath);
    });
  });
}


//email service
const nodemailer = require("nodemailer");

async function sendEmail(toEmail, pdfPath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ahmedtabish1212@gmail.com",
      pass: "kaenrwxshgewqzsw",
    },
  });

  const mailOptions = {
    from: "ahmedtabish1212@gmail.com",
    to: toEmail,
    subject: "Your Certificate",
    text: "Congratulations! Please find your certificate attached.",
    attachments: [
      {
        filename: "certificate.pdf",
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}


//main export function
async function generateCertificate(candidateData) {
  const certificateId = generateCertificateId();
  const qrPath = await generateQRCode(certificateId);
  const pdfPath = await generatePDF(candidateData, certificateId, qrPath);

  await sendEmail(candidateData.email, pdfPath);

  return {
    certificateId,
    pdfPath,
  };
}

module.exports = {
  generateCertificate,
};