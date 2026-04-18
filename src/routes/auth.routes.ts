import { login, register, verifyEmail, resetPasswordDirect, sendPasswordResetOTP, resetPasswordWithOTP, updateProfile, inviteAdmin, acceptAdminInvite, getAllUsers, getTotalUsers } from "../controllers/auth.controllers.js";
import { Hono } from "hono";

const authRoutes = new Hono();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/reset-direct", resetPasswordDirect);
authRoutes.post("/request-otp", sendPasswordResetOTP);
authRoutes.post("/reset-password-otp", resetPasswordWithOTP);
authRoutes.put("/update-profile", updateProfile);
authRoutes.post("/invite-admin", inviteAdmin);
authRoutes.post("/accept-invite", acceptAdminInvite);
authRoutes.get("/users", getAllUsers);
authRoutes.get("/total-users", getTotalUsers);

export default authRoutes;