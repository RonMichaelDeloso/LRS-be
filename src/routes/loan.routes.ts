import { Hono } from "hono";
import { createLoan, getAllLoans, getLoansByUser, returnBook, updateOverdueLoans } from "../controllers/loan.controllers.js";

const loanRoutes = new Hono();

loanRoutes.get("/", getAllLoans);
loanRoutes.get("/user/:id", getLoansByUser);  // Changed from student to user
loanRoutes.post("/", createLoan);
loanRoutes.put("/return/:id", returnBook);
loanRoutes.put("/overdue", updateOverdueLoans);

export default loanRoutes;