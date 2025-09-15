import { pool } from "../shared/db/conn.mysql.js";
import { Delivery } from "./delivery.entity.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class DeliveryRepository {
    // Obtener el delivery vigente (el más reciente)
    public async findLatest(): Promise<Delivery | undefined> {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM delivery ORDER BY fechaActualizacion DESC LIMIT 1"
        );
        if (rows.length === 0) return undefined;
        const row = rows[0];
        return new Delivery(row.idDelivery, row.precio, row.fechaActualizacion);
    }

    // Agregar un nuevo registro de delivery
    public async add(delivery: Delivery): Promise<Delivery> {
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO delivery (precio, fechaActualizacion) VALUES (?, ?)",
            [delivery.precio, delivery.fechaActualizacion]
        );
        delivery.idDelivery = result.insertId;
        return delivery;
    }

    // Buscar por fechaActualizacion (PK)
    public async findByFecha(fecha: Date): Promise<Delivery | undefined> {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM delivery WHERE fechaActualizacion = ?",
            [fecha]
        );
        if (rows.length === 0) return undefined;
        const row = rows[0];
        return new Delivery(row.idDelivery, row.precio, row.fechaActualizacion);
    }
}