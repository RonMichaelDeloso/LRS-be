import type { RowDataPacket } from "mysql2";

export interface StudentModel extends RowDataPacket {
  Student_id: number;
  Role_id: number;
  First_name: string;
  Last_name: string;
  Email: string;
  Password: string;
  Max_books_allowed: number;
  status: 'Active' | 'Inactive';
}