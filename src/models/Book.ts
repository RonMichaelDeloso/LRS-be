import type { RowDataPacket } from "mysql2";

export interface BookModel extends RowDataPacket {
  Book_id: number;
  Admin_id: number | null;
  isbn: string;
  Title: string;
  Author: string | null;
  Status: 'Available' | 'Loaned' | 'Reserved';  // ✅ 'Loaned' not 'Borrowed'
  created_at: Date;
}