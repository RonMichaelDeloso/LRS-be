import type { RowDataPacket } from "mysql2";

export interface BookGenreModel extends RowDataPacket {
  Book_id: number;
  Genre_id: number;
}