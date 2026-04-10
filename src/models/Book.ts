import type { RowDataPacket } from "mysql2";

export interface BookModel extends RowDataPacket {
  Book_id: number;
  User_id: number ;  // Changed from Admin_id to User_id (can be student or admin)
  isbn: string;
  Title: string;
  Author: string | null;
  Status: 'Available' | 'Loaned' | 'Reserved';
  created_at: Date;
}