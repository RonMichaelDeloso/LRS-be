import type { RowDataPacket } from "mysql2";

export interface AdminModel extends RowDataPacket {
  Admin_id: number;
  Role_id: number;
  employee_id: string;
  First_name: string;
  Last_name: string;
  Email: string;
  Password: string;
  Status: 'Active' | 'Inactive';
}