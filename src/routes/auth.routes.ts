import { login, register, verifyEmail, resetPasswordDirect } from "../controllers/auth.controllers.js";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/reset-direct", resetPasswordDirect);

export default authRoutes;