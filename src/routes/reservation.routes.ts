import { Hono } from "hono";
import { approveReservation, cancelReservation, createReservation, getAllReservations, getReservationByUser } from "../controllers/reservation.controllers.js";

const reservationRoutes = new Hono();

reservationRoutes.get("/", getAllReservations);
reservationRoutes.get("/user/:id", getReservationByUser);  // Changed from student to user
reservationRoutes.post("/", createReservation);  // Fixed typo: creatReservation → createReservation
reservationRoutes.put("/approve/:id", approveReservation);
reservationRoutes.put("/cancel/:id", cancelReservation);

export default reservationRoutes;