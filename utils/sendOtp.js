const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  try {
    
    const transporter = nodemailer.createTransport({
      // ✅ "service: 'gmail'" hata diya gaya hai
      host: process.env.EMAIL_HOST, // Ye automatically smtp.hostinger.com uthayega
      port: process.env.EMAIL_PORT || 465, 
      secure: true, // Port 465 ke liye secure true hona chahiye
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `"HareetechHR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🔐 Password Reset Request</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #2c3e50;">${otp}</h1>
          <p>This OTP will expire in <b>10 minutes</b>.</p>
          <hr/>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOTP;
