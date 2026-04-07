import type { Context } from "hono";
import pool from "../config/db.js";
import type { BookModel } from "../models/Book.js";
import type { GenreModel } from "../models/Genre.js";

export const getAllBooks = async (c: Context) => {
  try {
    const [rows] = await pool.query<BookModel[]>(`SELECT
         book.*, 
         GROUP_CONCAT(genre.Genre) as Genres 
         FROM book LEFT JOIN book_genre ON book.Book_id = book_genre.Book_id 
         LEFT JOIN genre ON book_genre.Genre_id = genre.Genre_id GROUP BY book.Book_id`);
    return c.json(rows, 200);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};

export const getBookById = async (c: Context) => {
const id = c.req.param("id");
try{
    const [rows] = await pool.query<BookModel[]>(
        `SELECT book.*,
        GROUP_CONCAT(genre.Genre) as Genres 
        FROM book 
        LEFT JOIN book_genre ON book.Book_id = book_genre.Book_id 
        LEFT JOIN genre ON book_genre.Genre_id = genre.Genre_id WHERE book.Book_id = ? GROUP BY book.Book_id`, [id]);
    if (rows.length === 0){
        return c.json({ message: "Book not found" }, 404);
    };

    return c.json(rows[0], 200);
        
    }catch (error) {
        return c.json({ message: "Server error", error }, 500);
    }
};

export const addBook = async (c: Context) => {
    const {Admin_id, isbn, Title, Author, Genre_id} = await c.req.json();

    try {
        const [result]: any = await pool.query(
            'INSERT INTO book (Admin_id, isbn, Title, Author) VALUES (?, ?, ?, ?)',
            [Admin_id, isbn, Title, Author]
        );

        const Book_id = result.insertId;

        if (Genre_id && Genre_id.length > 0) {
            const genreValues = Genre_id.map((g: number) => [Book_id, g]);
            await pool.query(
                'INSERT INTO book_genre (Book_id, Genre_id) VALUES ?',
                [genreValues]
            );
        }

        return c.json({ message: "Book added successfully", Book_id}, 201);
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }
};

export const updateBook = async (c: Context) => {
    const id = c.req.param("id");
    const { isbn, Title, Author, Status } = await c.req.json();

    try {
        await pool.query(
            'UPDATE book SET isbn = ?, Title = ?, Author = ?, Status = ? WHERE Book_id = ?',
            [isbn, Title, Author, Status, id]
        );

        return c.json ({ message: "Book updated successfully" }, 200);
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }
};

export const deleteBook = async (c: Context) => {
    const id = c.req.param("id");
    try {
        await pool.query('DELETE FROM book_genre WHERE Book_id = ?', [id]);
        await pool.query('DELETE FROM book WHERE Book_id = ?', [id]);
        
        return c.json({ message: "Book deleted successfully" }, 200);
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }
}

export const getAllGenres = async (c: Context) => {
    try {
        const [rows] = await pool.query<GenreModel[]>('SELECT * FROM genre');
        return c.json(rows, 200);
    } catch (error) {
        return c.json({ message: "Server error", error}, 500);
    }
};

export const addGenre = async (c: Context) => {
    const { Genre } = await c.req.json();

    try {
        await pool.query('INSERT INTO genre (Genre) VALUES (?)', [Genre]);
        return c.json ({ message: "Genre added successfully" }, 201);
    } catch (error) {
        return c.json({ message: "Server error", error }, 500);
    }
};