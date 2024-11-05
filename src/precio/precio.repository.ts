import { pool } from "../shared/db/conn.mysql.js";
import { Precio } from "./precio.entity.js";
import { RowDataPacket } from "mysql2";

export class PrecioRepository {
    public async getPrecioActual(idHamburguesa: number): Promise<number | null> {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT precio FROM precios 
             WHERE idHamburguesa = ? AND fechaVigencia <= CURDATE() 
             ORDER BY fechaVigencia DESC LIMIT 1`,
            [idHamburguesa]
        );
        return rows.length ? rows[0].precio : null;
    }
}
