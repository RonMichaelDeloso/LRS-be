
import { login, register } from "../controllers/auth.controllers.js";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);

export default authRoutes;