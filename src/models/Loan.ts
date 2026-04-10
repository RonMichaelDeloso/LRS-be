import type { RowDataPacket } from "mysql2";

export interface LoanModel extends RowDataPacket {
  Loan_id: number;
  User_id: number | null;  // Changed from Student_id to User_id
  Book_id: number | null;
  Borrow_date: Date;
  Due_date: Date;
  Return_date: Date | null;
  Status: 'Ongoing' | 'Returned' | 'Overdue';
}