import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import type { StudentModel } from "../models/Student.js";
import type { Context } from "hono";
import  jwt  from "jsonwebtoken";
import type { AdminModel } from "../models/Admin.js";

//---Register---
export const register = async (c: Context) => {
    const { First_name, Last_name, Email, Password } = await c.req.json();
    
    try{
        const [existing] = await pool.query<StudentModel[]>( "SELECT * FROM student WHERE Email = ?", [Email]);

        if (existing.length > 0) {
            return c.json({ message: "Email already existing"}, 400);
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        await pool.query(
            'INSERT INTO student (Role_id, First_name, Last_name, Email, Password) VALUES (1, ?, ?, ?, ?)',
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
        const [ studentRows ] = await pool.query<StudentModel[]>("SELECT * FROM student WHERE Email = ?", [Email]);

        if (studentRows.length > 0) {
            const student = studentRows[0];

            const isMatch = await bcrypt.compare(Password, student.Password);
            if (!isMatch) {
                return c.json({ message: "Invalid password"}, 401);
            }

            const role = student.Role_id === 2 ? "Admin" : "Student";

            const token = jwt.sign(
                { id: student.Student_id, role },
                process.env.JWT_SECRET!,
                { expiresIn: "1d"}
            );

            return c.json({
                message: "Login successful",
                role,
                token,
                user: {
                    id: student.Student_id,
                    First_name: student.First_name,
                    Last_name: student.Last_name,
                    Email: student.Email,
                    status: student.status
                }
            }, 200)
        } else {
           const [adminRows] = await pool.query<AdminModel[]>(
            "SELECT * FROM admin WHERE Email = ?", [Email]
           );

           if (adminRows.length > 0) {
            const admin = adminRows[0];

            const isMatch = await bcrypt.compare(Password, admin.Password);
            if (!isMatch) {
                return c.json({ message: "Invalid password"}, 401);
            }

            const token = jwt.sign(
                { id: admin.Admin_id, role: "Admin" },
                process.env.JWT_SECRET!,
                { expiresIn: "1d"}
            );

            return c.json({
                message: "Login successful",
                role: "Admin",
                token,
                user: {
                    id: admin.Admin_id,
                    First_name: admin.First_name,
                    Last_name: admin.Last_name,
                    Email: admin.Email,
                    Status: admin.Status
                }
            }, 200)
           } else {
            return c.json({ message: "Email not found" }, 404);
           }
        }
    } catch (error) {
        return c.json ({ message: "Server error", error}, 500)
    }
};

