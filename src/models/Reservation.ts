import type { RowDataPacket } from "mysql2";

export interface ReservationModel extends RowDataPacket {
  Reserve_id: number;
  Student_id: number | null;
  Book_id: number | null;
  Reserve_date: Date;
  Due_date: Date | null;
  Return_date: Date | null;
  Status: 'Pending' | 'Completed' | 'Cancelled'; 
}