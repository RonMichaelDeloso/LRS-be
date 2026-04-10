import type { Context } from "hono";
import pool from "../config/db.js";
import type { NotificationModel } from "../models/Notification.js";

// GET notifications for a specific user (newest first)
export const getNotificationsByUser = async (c: Context) => {
    const userId = c.req.param("id");

    try {
        const [rows] = await pool.query<NotificationModel[]>(
            `SELECT * FROM notifications WHERE User_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        return c.json(rows, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

// PUT mark a single notification as read
export const markAsRead = async (c: Context) => {
    const id = c.req.param("id");

    try {
        await pool.query(
            `UPDATE notifications SET is_read = 1 WHERE Notification_id = ?`,
            [id]
        );
        return c.json({ message: "Notification marked as read" }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

// PUT mark ALL notifications as read for a user
export const markAllAsRead = async (c: Context) => {
    const userId = c.req.param("userId");

    try {
        await pool.query(
            `UPDATE notifications SET is_read = 1 WHERE User_id = ?`,
            [userId]
        );
        return c.json({ message: "All notifications marked as read" }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

// DELETE a single notification permanently
export const deleteNotification = async (c: Context) => {
    const id = c.req.param("id");

    try {
        await pool.query(
            `DELETE FROM notifications WHERE Notification_id = ?`,
            [id]
        );
        return c.json({ message: "Notification deleted" }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};

// DELETE all notifications for a user
export const deleteAllNotifications = async (c: Context) => {
    const userId = c.req.param("userId");

    try {
        await pool.query(
            `DELETE FROM notifications WHERE User_id = ?`,
            [userId]
        );
        return c.json({ message: "All notifications deleted" }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: "Server error" }, 500);
    }
};
