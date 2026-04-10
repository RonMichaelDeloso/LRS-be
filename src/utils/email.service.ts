import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,    // ← Comes from .env
    pass: process.env.EMAIL_PASS,    // ← Comes from .env
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
        <h2 style="color: #d49a32;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the OTP below:</p>
        <h1 style="color: #234452; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        <p>This OTP will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <small>Library Management System</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};