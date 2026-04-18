import nodemailer from 'nodemailer';

export const sendOTPEmail = async (to: string, otp: string): Promise<void> => {
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    if (!SMTP_USER || !SMTP_PASS || SMTP_USER.includes('your-') || SMTP_PASS.includes('your-')) {
        // Fallback: just log to console so dev can test without real email credentials
        console.log('==============================');
        console.log(`[OTP - NO EMAIL CONFIG]`);
        console.log(`To: ${to}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log('==============================');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    const mailOptions = {
        from: `"Library Reservation System" <${SMTP_USER}>`,
        to: to,
        subject: 'Your Password Reset OTP Code',
        text: `Your OTP code is: ${otp}. Valid for 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 30px; border: 1px solid #e0d8c8; border-radius: 12px;">
                <h2 style="color: #1a1a1a; text-align: center;">Library Reservation System</h2>
                <p style="color: #555;">You requested a password reset. Use the OTP code below:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #d49a32;">${otp}</span>
                </div>
                <p style="color: #888; font-size: 13px;">This code expires in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✔ OTP email sent to ${to}`);
    } catch (error: any) {
        console.error('--- NODEMAILER ERROR ---');
        console.error('Message:', error.message);
        console.error('------------------------');
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};
