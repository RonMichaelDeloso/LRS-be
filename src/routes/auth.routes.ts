import { login, register, forgotPassword, resetPassword, resendOTP } from "../controllers/auth.controllers.js";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/forgot", forgotPassword);
authRoutes.post("/reset", resetPassword);
authRoutes.post("/resend-otp", resendOTP);

export default authRoutes;