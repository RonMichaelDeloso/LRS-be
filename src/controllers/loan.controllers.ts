import type { Context } from "hono";
import pool from "../config/db.js";
import type { LoanModel } from "../models/Loan.js";

    export const getAllLoans = async (c: Context) => {
        try {
            const [rows] = await pool.query<LoanModel[]>(
                `SELECT loan.*,
                student.First_name,
                student.Last_name,
                student.Email,
                book.Title,
                book.Author,
                book.isbn
                FROM loan
                JOIN student ON loan.Student_id = student.Student_id
                JOIN book On loan.Book_id = book.Book_id`
            );

            return c.json(rows, 200);
        } catch (error) {
            return c.json ({ message: "Server error", error }, 500);
        }
    };

    export const getLoansByStudent = async (c: Context) => {
        const id = c.req.param("id");
        
        try {
            const [rows] = await pool.query<LoanModel[]>(
                `SELECT loan.*,
                book.Title,
                book.Athour,
                book.isbn,
                book.Status
                FROM loan
                JOIN book ON loan.Book_id = book.Book_id
                WHERE loan.Student_id = ?`, [id]
            );

            return c.json(rows, 200);
        } catch (error) {
            return c.json({ message: "Server error", error}, 500);
        }
    };

    export const createLoan = async ( c: Context ) => {
        const { Student_id, Book_id, Borrow_date, Due_date } = await c.req.json();

        try {
            const [book]: any = await pool.query(
                `SELECT * FROM book WHERE book_id = ? and Status = 'Available'`, [Book_id]
            );

            if (book.length === 0) {
                return c.json({ message: "Book is available"}, 400);
            }

            const [activeLoans]: any = await pool.query(
                `SELECT COUNT(*) as count FROM loan
                WHERE student_id = ? AND Status = 'Ongoing'`, [Student_id]
            );

            const [student]: any = await pool.query(
                `SELECT Max_books_allowed FROM student WHERE Student_id = ?`, [Student_id]
            );

            if (activeLoans[0].count >= student[0].Max_books_allowed) {
                return c.json({ message: "Student has reached maximum books allowed" }, 400);
            }

            await pool.query(
                `INSERT INTO loan (Student_id, Book_id, Borrow_date, Due_date)
                VALUES (?, ?, ?, ?)`,
                [Student_id, Book_id, Borrow_date, Due_date]
            );

            await pool.query(
                `UPDATE book SET Status = 'Loaned' WHERE Book_id = ?`, [Book_id]
            );

            return c.json({ message: "Loan created successfully" }, 201);
        } catch (error) {
            return c.json ({ message: "Server error", error}, 500);
        }
    };

    export const returnBook = async (c: Context) => {
        const id = c.req.param("id");
        const { Return_date } = await c.req.json();

        try {
           await pool.query(
            `UPDATE loan SET Status = 'Returned', Return_date = ? WHERE Loan_id = ?`, [Return_date, id]
        );

            const [loan]: any = await pool.query(
                `SELECT Book_id FROM loan WHERE loan_id = ?`, [id]
            );

            await pool.query(
                `UPDATE book SET Status = 'Available' WHERE Book_id = ?`, [loan[0].Book_id]
            );

            return c.json({ message: "Book returned successfully" }, 200);
        } catch (error) {
            return c.json({ message: "Server error", error}, 500);
        }
    };

    export const updateOverdueLoans = async (c: Context) => {
        try {
            await pool.query(
                `UPDATE loan SET Status = 'Overdue'
                WHERE Status = 'Ongoing' AND Due_date < CURDATE()`
            );

            return c.json({ message: "Overdue loans updated" }, 200); 
        } catch (error) {
            return c.json({ message: "Server error", error}, 500);
        }
    };