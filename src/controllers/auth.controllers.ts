import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import type { UserModel } from "../models/Users.js";  
import type { Context } from "hono";
import jwt from "jsonwebtoken";

// Generate random 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

//---Register---
export const register = async (c: Context) => {
    const { First_name, Last_name, Email, Password } = await c.req.json();
    
    try{
        const [existing] = await pool.query<UserModel[]>("SELECT * FROM users WHERE Email = ?", [Email]);

        if (existing.length > 0) {
            return c.json({ message: "Email already existing"}, 400);
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        await pool.query(
            'INSERT INTO users (Role_id, First_name, Last_name, Email, Password, Max_books_allowed, status) VALUES (1, ?, ?, ?, ?, 5, "Active")',
            [First_name, Last_name, Email, hashedPassword]
        );

        return c.json({ message: "Registered Successfully"}, 201);
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }
};

//---Login---
export const login = async (c: Context) => {
    const { Email, Password } = await c.req.json();

    try{
        const [usersRows] = await pool.query<UserModel[]>("SELECT * FROM users WHERE Email = ?", [Email]);

        if (usersRows.length === 0) {
            return c.json({ message: "Email not found" }, 404);
        }

        const user = usersRows[0];

        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return c.json({ message: "Invalid password"}, 401);
        }

        const role = user.Role_id === 2 ? "Admin" : "Student";

        const token = jwt.sign(
            { id: user.User_id, role },
            process.env.JWT_SECRET!,
            { expiresIn: "1d"}
        );

        return c.json({
            message: "Login successful",
            role,
            token,
            user: {
                id: user.User_id,  
                First_name: user.First_name,  
                Last_name: user.Last_name,    
                Email: user.Email,            
                status: user.status
            }
        }, 200);
        
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }
};

//---Forgot Password - Send OTP---
export const forgotPassword = async (c: Context) => {
    const { Email } = await c.req.json();

    try {
        // Check if user exists
        const [users] = await pool.query<UserModel[]>(
            "SELECT * FROM users WHERE Email = ?",
            [Email]
        );

        if (users.length === 0) {
            return c.json({ message: "Email not found" }, 404);
        }

        const user = users[0];
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 15);

        // Save OTP in database
        await pool.query(
            `UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE User_id = ?`,
            [otp, otpExpires, user.User_id]
        );

        // For now, return OTP in response (in production, send via email)
        console.log(`OTP for ${Email}: ${otp}`);

        return c.json({
            message: "OTP sent to your email",
            otp: otp, // Remove this in production
            email: Email
        }, 200);

    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

//---Reset Password - Verify OTP and set new password---
export const resetPassword = async (c: Context) => {
    const { Email, OTP, NewPassword } = await c.req.json();

    try {
        // Find user with valid OTP
        const [users] = await pool.query<UserModel[]>(
            `SELECT * FROM users 
             WHERE Email = ? 
             AND reset_otp = ? 
             AND reset_otp_expires > NOW()`,
            [Email, OTP]
        );

        if (users.length === 0) {
            return c.json({ message: "Invalid or expired OTP" }, 400);
        }

        const user = users[0];
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(NewPassword, 10);

        // Update password and clear OTP
        await pool.query(
            `UPDATE users 
             SET Password = ?, reset_otp = NULL, reset_otp_expires = NULL 
             WHERE User_id = ?`,
            [hashedPassword, user.User_id]
        );

        return c.json({ message: "Password reset successfully" }, 200);

    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

//---Resend OTP---
export const resendOTP = async (c: Context) => {
    const { Email } = await c.req.json();

    try {
        const [users] = await pool.query<UserModel[]>(
            "SELECT * FROM users WHERE Email = ?",
            [Email]
        );

        if (users.length === 0) {
            return c.json({ message: "Email not found" }, 404);
        }

        const user = users[0];
        
        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 15);

        await pool.query(
            `UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE User_id = ?`,
            [otp, otpExpires, user.User_id]
        );

        console.log(`New OTP for ${Email}: ${otp}`);

        return c.json({
            message: "New OTP sent to your email",
            otp: otp, // Remove in production
            email: Email
        }, 200);

    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};