import { Hono } from "hono";
import { addBook, addGenre, deleteBook, getAllBooks, getAllGenres, getBookById, updateBook } from "../controllers/book.controller.js";

const bookRoutes = new Hono();

bookRoutes.get ("/", getAllBooks);
bookRoutes.get ("/:id", getBookById);
bookRoutes.post ("/", addBook);
bookRoutes.put ("/:id", updateBook);
bookRoutes.delete ("/:id", deleteBook);
bookRoutes.get ("/genres", getAllGenres);
bookRoutes.post ("/genres", addGenre);

export default bookRoutes;

