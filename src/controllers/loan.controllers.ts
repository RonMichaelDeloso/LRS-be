import type { Context } from "hono";
import pool from "../config/db.js";
import type { LoanModel } from "../models/Loan.js";
import type { UserModel } from "../models/Users.js";
import type { BookModel } from "../models/Book.js";

export const getAllLoans = async (c: Context) => {
    try {
        const [rows] = await pool.query(
            `SELECT loan.*,
                users.First_name,
                users.Last_name,
                users.Email,
                book.Title,
                book.Author,
                book.isbn,
                book.Image_URL
            FROM loan
            JOIN users ON loan.User_id = users.User_id
            JOIN book ON loan.Book_id = book.Book_id`
        );

        return c.json(rows, 200);
    } catch (error) {
        return c.json({ message: "Server error", error }, 500);
    }
};

export const getLoansByUser = async (c: Context) => {
    const id = c.req.param("id");
    
    try {
        const [rows] = await pool.query<LoanModel[]>(
            `SELECT loan.*,
                book.Title,
                book.Author,
                book.isbn,
                book.Status AS Book_Status,
                book.Image_URL
            FROM loan
            JOIN book ON loan.Book_id = book.Book_id
            WHERE loan.User_id = ?`, [id]
        );

        return c.json(rows, 200);
    } catch (error) {
        return c.json({ message: "Server error", error }, 500);
    }
};

export const createLoan = async (c: Context) => {
    const { User_id, Book_id, Borrow_date, Due_date } = await c.req.json();

    try {
        // Check if book is available
        const [book]: any = await pool.query(
            `SELECT * FROM book WHERE Book_id = ? AND Status = 'Available'`, [Book_id]
        );

        if (book.length === 0) {
            return c.json({ message: "Book is not available"}, 400);
        }

        // Check active loans for user
        const [activeLoans]: any = await pool.query(
            `SELECT COUNT(*) as count FROM loan
            WHERE User_id = ? AND Status = 'Ongoing'`, [User_id]
        );

        // Get user's max books allowed
        const [user]: any = await pool.query(
            `SELECT Max_books_allowed FROM users WHERE User_id = ?`, [User_id]
        );

        if (activeLoans[0].count >= user[0].Max_books_allowed) {
            return c.json({ message: "User has reached maximum books allowed" }, 400);
        }

        // Create loan
        await pool.query(
            `INSERT INTO loan (User_id, Book_id, Borrow_date, Due_date, Status)
            VALUES (?, ?, ?, ?, 'Ongoing')`,
            [User_id, Book_id, Borrow_date, Due_date]
        );

        // Update book status
        await pool.query(
            `UPDATE book SET Status = 'Loaned' WHERE Book_id = ?`, [Book_id]
        );

        return c.json({ message: "Loan created successfully" }, 201);
    } catch (error) {
        return c.json({ message: "Server error", error }, 500);
    }
};

export const returnBook = async (c: Context) => {
    const id = c.req.param("id");
    const { Return_date } = await c.req.json();

    try {
        // Update loan status
        await pool.query(
            `UPDATE loan SET Status = 'Returned', Return_date = ? WHERE Loan_id = ?`, 
            [Return_date, id]
        );

        // Get book_id from loan
        const [loan]: any = await pool.query(
            `SELECT Book_id FROM loan WHERE Loan_id = ?`, [id]
        );

        // Update book status to available
        await pool.query(
            `UPDATE book SET Status = 'Available' WHERE Book_id = ?`, 
            [loan[0].Book_id]
        );

        return c.json({ message: "Book returned successfully" }, 200);
    } catch (error) {
        return c.json({ message: "Server error", error }, 500);
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
        return c.json({ message: "Server error", error }, 500);
    }
};