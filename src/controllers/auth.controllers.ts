import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import type { UserModel } from "../models/Users.js";  
import type { Context } from "hono";
import jwt from "jsonwebtoken";


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

//---Forgot Password Step 1: Verify email exists---
export const verifyEmail = async (c: Context) => {
    const { Email } = await c.req.json();

    try {
        const [users] = await pool.query<UserModel[]>(
            "SELECT * FROM users WHERE Email = ?",
            [Email]
        );

        if (users.length === 0) {
            return c.json({ message: "Email not found. Please check and try again." }, 404);
        }

        return c.json({ message: "Email verified." }, 200);

    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

//---Forgot Password Step 2: Reset password directly (no OTP)---
export const resetPasswordDirect = async (c: Context) => {
    const { Email, NewPassword } = await c.req.json();

    try {
        const [users] = await pool.query<UserModel[]>(
            "SELECT * FROM users WHERE Email = ?",
            [Email]
        );

        if (users.length === 0) {
            return c.json({ message: "Email not found." }, 404);
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(NewPassword, 10);

        await pool.query(
            "UPDATE users SET Password = ? WHERE User_id = ?",
            [hashedPassword, user.User_id]
        );

        return c.json({ message: "Password reset successfully." }, 200);

    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

//---Update Profile---
export const updateProfile = async (c: Context) => {
    const { User_id, First_name, Last_name, Email } = await c.req.json();
    try {
        await pool.query(
            "UPDATE users SET First_name = ?, Last_name = ?, Email = ? WHERE User_id = ?",
            [First_name, Last_name, Email, User_id]
        );
        return c.json({ message: "Profile updated successfully" }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error", error }, 500);
    }
};

//---Admin Invite: send a notification to the student with type 'admin_invite'---
export const inviteAdmin = async (c: Context) => {
    const { Email } = await c.req.json();
    try {
        const [users] = await pool.query<UserModel[]>("SELECT * FROM users WHERE Email = ? AND Role_id = 1", [Email]);
        if (users.length === 0) {
            return c.json({ message: "Student with that email not found." }, 404);
        }
        const student = users[0];

        // Check if there's already a pending invite
        const [existing] = await pool.query<any[]>(
            `SELECT * FROM notifications WHERE User_id = ? AND Message LIKE 'You have been invited to become an Admin%' AND is_read = 0`,
            [student.User_id]
        );
        if (existing.length > 0) {
            return c.json({ message: "An invite is already pending for this student." }, 400);
        }

        await pool.query(
            `INSERT INTO notifications (User_id, Message, is_read) VALUES (?, ?, 0)`,
            [student.User_id, `You have been invited to become an Admin of the Library System. Click 'Join as Admin' to accept.`]
        );

        return c.json({ message: "Invite sent successfully!" }, 201);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error", error }, 500);
    }
};

//---Accept Admin Invite: upgrade student to Admin---
export const acceptAdminInvite = async (c: Context) => {
    const { Notification_id, User_id } = await c.req.json();
    try {
        // Upgrade the user role to Admin
        await pool.query(`UPDATE users SET Role_id = 2 WHERE User_id = ?`, [User_id]);
        // Mark notification as read/handled
        await pool.query(`DELETE FROM notifications WHERE Notification_id = ?`, [Notification_id]);
        return c.json({ message: "You are now an Admin!" }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error", error }, 500);
    }
};