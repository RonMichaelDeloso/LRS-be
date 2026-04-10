import type { Context } from "hono";
import pool from "../config/db.js";
import type { ReservationModel } from "../models/Reservation.js";
import type { UserModel } from "../models/Users.js";
import type { BookModel } from "../models/Book.js";

export const getAllReservations = async (c: Context) => {
    try {
        const [rows] = await pool.query(
            `SELECT reservation.*,
            users.First_name,
            users.Last_name,
            users.Email,
            book.Title,
            book.Author,
            book.isbn,
            book.Image_URL
            FROM reservation
            JOIN users ON reservation.User_id = users.User_id
            JOIN book ON reservation.Book_id = book.Book_id`
        );

        return c.json(rows, 200);
    } catch(error) {
        return c.json({ message: "Server error", error}, 500);
    }
};

export const getReservationByUser = async (c: Context) => {
    const id = c.req.param("id");

    try{
        const [rows] = await pool.query<ReservationModel[]>(
            `SELECT reservation.*,
            book.Title,
            book.Author,
            book.isbn,
            book.Image_URL,
            book.Status AS Book_Status
            FROM reservation
            JOIN book ON reservation.Book_id = book.Book_id
            WHERE reservation.User_id = ?`, [id]
        );
        return c.json(rows, 200);
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }  
};

export const createReservation = async (c: Context) => {
    const { User_id, Book_id, Reserve_date, Due_date } = await c.req.json();

    try {
        // Check if book is available
        const [book]: any = await pool.query(
            `SELECT * FROM book WHERE Book_id = ? AND Status = 'Available'`, [Book_id]
        );

        if (book.length === 0) {
            return c.json({ message: "Book is not available for reservation" }, 400);
        }

        // Check for existing pending reservation
        const [existing]: any = await pool.query(
            `SELECT * FROM reservation
            WHERE User_id = ?
            AND Book_id = ?
            AND Status = 'Pending'`,
            [User_id, Book_id]
        );

        if (existing.length > 0) {
            return c.json({ message: "You already have a pending reservation for this book"}, 400);
        }

        // Create reservation
        await pool.query(
            `INSERT INTO reservation (User_id, Book_id, Reserve_date, Due_date, Status)
            VALUES (?, ?, ?, ?, 'Pending')`,
            [User_id, Book_id, Reserve_date, Due_date]
        );

        // Update book status
        await pool.query(
            `UPDATE book SET Status = 'Reserved' WHERE Book_id = ?`, [Book_id]
        );

        // Notify admins about the new reservation
        const [adminRows]: any = await pool.query(
            `SELECT users.User_id FROM users JOIN role ON users.Role_id = role.Role_id WHERE role.Role_name = 'Admin'`
        );
        const [userRows]: any = await pool.query(
            `SELECT First_name, Last_name FROM users WHERE User_id = ?`, [User_id]
        );
        
        if (userRows.length > 0) {
            const username = `${userRows[0].First_name} ${userRows[0].Last_name}`;
            const message = `A new reservation has been made by ${username} for the book "${book[0].Title}".`;
            for (let admin of adminRows) {
                await pool.query(
                    `INSERT INTO notifications (User_id, Message, is_read) VALUES (?, ?, 0)`,
                    [admin.User_id, message]
                );
            }
        }

        return c.json({ message: "Reservation created successfully"}, 201);
    } catch (error){
        return c.json({ message: "Server error", error}, 500);
    }
};

export const approveReservation = async (c: Context) => {
    const id = c.req.param("id");

    try{
        // Get reservation with user and book info BEFORE updating
        const [reservationRows]: any = await pool.query(
            `SELECT reservation.User_id, reservation.Book_id, book.Title
             FROM reservation
             JOIN book ON reservation.Book_id = book.Book_id
             WHERE reservation.Reserve_id = ?`, [id]
        );

        if (reservationRows.length === 0) {
            return c.json({ message: "Reservation not found" }, 404);
        }

        const { User_id, Book_id, Title } = reservationRows[0];

        // Update reservation status to Completed
        await pool.query(
            `UPDATE reservation SET Status = 'Completed' WHERE Reserve_id = ?`, [id]
        );

        // Update book status to Loaned
        await pool.query(
            `UPDATE book SET Status = 'Loaned' WHERE Book_id = ?`, [Book_id]
        );

        // Insert notification for the student
        await pool.query(
            `INSERT INTO notifications (User_id, Message, is_read)
             VALUES (?, ?, 0)`,
            [User_id, `Your book "${Title}" is ready to pick up at the Main Campus Library!`]
        );

        return c.json({ message: "Reservation approved successfully" }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error", error}, 500);
    }
};

export const cancelReservation = async (c: Context) => {
    const id = c.req.param("id");

    try {
        // Get book_id from reservation
        const [reservation]: any = await pool.query(
            `SELECT Book_id FROM reservation WHERE Reserve_id = ?`, [id]
        );

        // Update reservation status
        await pool.query(
            `UPDATE reservation SET Status = 'Cancelled' WHERE Reserve_id = ?`, [id]
        );

        // Update book status back to available
        await pool.query(
            `UPDATE book SET Status = 'Available' WHERE Book_id = ?`,
            [reservation[0].Book_id]
        );

        return c.json({ message: "Reservation cancelled successfully"}, 200);
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }
};