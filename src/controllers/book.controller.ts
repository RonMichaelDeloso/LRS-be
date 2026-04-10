import type { Context } from "hono";
import pool from "../config/db.js";
import type { BookModel } from "../models/Book.js";
import type { GenreModel } from "../models/Genre.js";
import type { UserModel } from "../models/Users.js";
import fs from 'fs';
import path from 'path';

export const getAllBooks = async (c: Context) => {
  try {
    const [rows] = await pool.query<BookModel[]>(`SELECT
         book.*, 
         GROUP_CONCAT(genre.Genre) as Genres 
         FROM book 
         LEFT JOIN book_genre ON book.Book_id = book_genre.Book_id 
         LEFT JOIN genre ON book_genre.Genre_id = genre.Genre_id 
         GROUP BY book.Book_id`);
    return c.json(rows, 200);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};

export const getBookById = async (c: Context) => {
  const id = c.req.param("id");
  try {
    const [rows] = await pool.query<BookModel[]>(
      `SELECT book.*,
        GROUP_CONCAT(genre.Genre) as Genres 
        FROM book 
        LEFT JOIN book_genre ON book.Book_id = book_genre.Book_id 
        LEFT JOIN genre ON book_genre.Genre_id = genre.Genre_id 
        WHERE book.Book_id = ? 
        GROUP BY book.Book_id`, 
      [id]
    );
    
    if (rows.length === 0) {
      return c.json({ message: "Book not found" }, 404);
    }

    return c.json(rows[0], 200);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};

export const addBook = async (c: Context) => {
  const body = await c.req.parseBody();
  const User_id = body.User_id as string;
  const isbn = body.isbn as string;
  const Title = body.Title as string;
  const Author = body.Author as string;
  
  let Genre_id: number[] = [];
  if (body.Genre_id) {
    try { Genre_id = JSON.parse(body.Genre_id as string); } catch (e) {}
  }

  let Image_URL: string | null = null;
  const image = body.image instanceof File ? body.image : undefined;

  if (image) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    fs.writeFileSync(filePath, buffer);
    Image_URL = `uploads/${fileName}`;
  }

  try {
    const [users] = await pool.query<UserModel[]>(
      "SELECT * FROM users WHERE User_id = ? AND Role_id = 2", 
      [User_id]
    );
    
    if (users.length === 0) {
      if (Image_URL) fs.unlinkSync(path.join(process.cwd(), Image_URL));
      return c.json({ message: "Unauthorized. Only admins can add books." }, 403);
    }

    const [result]: any = await pool.query(
      'INSERT INTO book (User_id, isbn, Title, Author, Image_URL) VALUES (?, ?, ?, ?, ?)',
      [User_id, isbn, Title, Author, Image_URL]
    );

    const Book_id = result.insertId;

    if (Genre_id && Genre_id.length > 0) {
      const genreValues = Genre_id.map((g: number) => [Book_id, g]);
      await pool.query(
        'INSERT INTO book_genre (Book_id, Genre_id) VALUES ?',
        [genreValues]
      );
    }

    return c.json({ message: "Book added successfully", Book_id }, 201);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};

export const updateBook = async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();
  const isbn = body.isbn as string;
  const Title = body.Title as string;
  const Author = body.Author as string;
  const Status = body.Status as string;

  const image = body.image instanceof File ? body.image : undefined;

  try {
    let Image_URL: string | null = null;
    if (image) {
      const [existingBooks] = await pool.query<BookModel[]>('SELECT Image_URL FROM book WHERE Book_id = ?', [id]);
      if (existingBooks.length > 0 && existingBooks[0].Image_URL) {
        const oldFilePath = path.join(process.cwd(), existingBooks[0].Image_URL);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '_')}`;
      const filePath = path.join(process.cwd(), 'uploads', fileName);
      fs.writeFileSync(filePath, buffer);
      Image_URL = `uploads/${fileName}`;
      
      await pool.query(
        'UPDATE book SET isbn = ?, Title = ?, Author = ?, Status = ?, Image_URL = ? WHERE Book_id = ?',
        [isbn, Title, Author, Status, Image_URL, id]
      );
    } else {
      await pool.query(
        'UPDATE book SET isbn = ?, Title = ?, Author = ?, Status = ? WHERE Book_id = ?',
        [isbn, Title, Author, Status, id]
      );
    }

    return c.json({ message: "Book updated successfully" }, 200);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};

export const deleteBook = async (c: Context) => {
  const id = c.req.param("id");
  try {
    const [existingBooks] = await pool.query<BookModel[]>('SELECT Image_URL FROM book WHERE Book_id = ?', [id]);
    if (existingBooks.length > 0 && existingBooks[0].Image_URL) {
      const oldFilePath = path.join(process.cwd(), existingBooks[0].Image_URL);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    await pool.query('DELETE FROM book_genre WHERE Book_id = ?', [id]);
    await pool.query('DELETE FROM book WHERE Book_id = ?', [id]);
    
    return c.json({ message: "Book deleted successfully" }, 200);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};

export const getAllGenres = async (c: Context) => {
  try {
    const [rows] = await pool.query<GenreModel[]>('SELECT * FROM genre');
    return c.json(rows, 200);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};

export const addGenre = async (c: Context) => {
  const { Genre } = await c.req.json();

  try {
    await pool.query('INSERT INTO genre (Genre) VALUES (?)', [Genre]);
    return c.json({ message: "Genre added successfully" }, 201);
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};