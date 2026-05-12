const nodemailer = require("nodemailer");

const sendEmail = async (
  to,
  subject,
  html,
  attachments = [],
  senderName = "HareetechHR" // Yahan apni company ka naam daal sakte hain
) => {
  try {
    const transporter = nodemailer.createTransport({
      // ✅ Gmail service hata di gayi hai, ab ye .env se Hostinger uthayega
      host: process.env.EMAIL_HOST, 
      port: process.env.EMAIL_PORT || 465, 
      secure: true, // ✅ Port 465 ke liye ye true hona 100% zaroori hai
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"${senderName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    
  } catch (err) {
    console.error("Email send error:", err.message);
    throw err;
  }
};

module.exports = sendEmail;
