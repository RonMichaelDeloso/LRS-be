import type { RowDataPacket } from "mysql2";

export interface UserModel extends RowDataPacket {
  User_id: number;
  Role_id: number;
  First_name: string;
  Last_name: string;
  Email: string;
  Password: string;
  Max_books_allowed: number;
  status: 'Active' | 'Inactive';
  employee_id: string | null;  // Added for admin users
}