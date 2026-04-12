import type { RowDataPacket } from "mysql2";

export interface NotificationModel extends RowDataPacket {
    Notification_id: number;
    User_id: number;
    Message: string;
    type: string;
    is_read: number;
    created_at: Date;
}
