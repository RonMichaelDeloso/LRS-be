import type { RowDataPacket } from "mysql2";

export interface RoleModel extends RowDataPacket {
  Role_id: number;
  Role_name: 'Student' | 'Admin';
}
