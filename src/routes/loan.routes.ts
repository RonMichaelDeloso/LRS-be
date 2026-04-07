import { Hono } from "hono";
import { createLoan, getAllLoans, getLoansByStudent, returnBook, updateOverdueLoans } from "../controllers/loan.controllers.js";

const loanRoutes = new Hono();

loanRoutes.get("/", getAllLoans);
loanRoutes.get("/student/:id", getLoansByStudent);
loanRoutes.post("/", createLoan);
loanRoutes.put("/return/:id", returnBook);
loanRoutes.put("/overdue", updateOverdueLoans);

export default loanRoutes;