import type { RowDataPacket } from "mysql2";

export interface GenreModel extends RowDataPacket {
  Genre_id: number;
  Genre: string;
}