import pool from "../config/db.js";

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOTP(userId: number, otpCode: string): Promise<void> {
    await pool.query(
        "INSERT INTO otp (User_id, OTP_code, created_at, is_used) VALUES (?, ?, NOW(), 0)",
        [userId, otpCode]
    );
}

export async function verifyOTP(userId: number, otpCode: string): Promise<boolean> {
    // Check if OTP matches, is not used, and is younger than 10 minutes
    const [rows]: any = await pool.query(
        `SELECT * FROM otp
         WHERE User_id = ? 
         AND OTP_code = ?
         AND is_used = 0 
         AND created_at > NOW() - INTERVAL 10 MINUTE
         ORDER BY created_at DESC LIMIT 1`,
        [userId, otpCode]
    );
    
    if (rows.length === 0) return false;

    // Use OTPid from the row to mark it as used
    await pool.query(
        "UPDATE otp SET is_used = 1 WHERE OTPid = ?",
        [rows[0].OTPid]
    );

    return true;    
}