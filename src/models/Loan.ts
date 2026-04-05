import type { RowDataPacket } from "mysql2";

export interface LoanModel extends RowDataPacket {
  Loan_id: number;
  Student_id: number | null;
  Book_id: number | null;
  Borrow_date: Date;
  Due_date: Date;
  Return_date: Date | null;
  Status: 'Ongoing' | 'Returned' | 'Overdue';  // ✅ 'Ongoing' not 'Active'
}