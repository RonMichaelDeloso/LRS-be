import { Hono } from "hono";
import {
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from "../controllers/notification.controllers.js";

const notificationRoutes = new Hono();

notificationRoutes.get("/user/:id", getNotificationsByUser);
notificationRoutes.put("/read/:id", markAsRead);
notificationRoutes.put("/read-all/:userId", markAllAsRead);
notificationRoutes.delete("/:id", deleteNotification);
notificationRoutes.delete("/all/:userId", deleteAllNotifications);

export default notificationRoutes;
