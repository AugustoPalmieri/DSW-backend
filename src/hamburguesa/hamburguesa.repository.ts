import { Repository } from "../shared/repository.js";
import { Hamburguesa } from "./hamburguesa.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class HamburguesaRepository implements Repository<Hamburguesa> {
    public async findAll(): Promise<Hamburguesa[] | undefined> {
        const [hamburguesas] = await pool.query<RowDataPacket[]>(
            "SELECT idHamburguesa, nombre, descripcion, imagen FROM hamburguesas"
        );
        return hamburguesas as Hamburguesa[];
    }

    public async findOne(item: { id: string }): Promise<Hamburguesa | undefined> {
        const id = Number.parseInt(item.id);
        const [hamburguesas] = await pool.query<RowDataPacket[]>(
            "SELECT idHamburguesa, nombre, descripcion,imagen FROM hamburguesas WHERE idHamburguesa = ?",
            [id]
        );
        if (hamburguesas.length === 0) {
            return undefined;
        }
        return hamburguesas[0] as Hamburguesa;
    }

    public async add(HamburguesaInput: Hamburguesa): Promise<Hamburguesa | undefined> {
        const { idHamburguesa, precio, ...hamburguesaRow } = HamburguesaInput;

        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO hamburguesas SET ?",
            [hamburguesaRow]
        );
        HamburguesaInput.idHamburguesa = result.insertId;

        if (precio !== undefined) {
            const fechaVigencia = new Date();
            await pool.query(
                "INSERT INTO precios (idHamburguesa, fechaVigencia, precio) VALUES (?, ?, ?)",
                [HamburguesaInput.idHamburguesa, fechaVigencia, precio]
            );
        }

        return HamburguesaInput;
    }

    public async update(id: string, hamburguesaInput: Hamburguesa): Promise<Hamburguesa | undefined> {
        const hamburguesaId = Number.parseInt(id);
        const { precio, ...hamburguesaRow } = hamburguesaInput;
    
        // Actualizar datos de la hamburguesa
        await pool.query("UPDATE hamburguesas SET ? WHERE idHamburguesa = ?", [
            hamburguesaRow,
            hamburguesaId,
        ]);
    
        if (precio !== undefined) {
            const fechaVigencia = new Date();
    
            // Insertar o actualizar precio en la tabla `precios`
            await pool.query(
                `INSERT INTO precios (idHamburguesa, fechaVigencia, precio) 
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE precio = VALUES(precio)`,
                [hamburguesaId, fechaVigencia, precio]
            );
        }
    
        return await this.findOne({ id });
    }

public async delete(item: { id: string }): Promise<Hamburguesa | undefined> {
        try {
            const hamburguesaToDelete = await this.findOne(item);
            if (!hamburguesaToDelete) {
                return undefined;
            }
            const hamburguesaId = Number.parseInt(item.id);

            await pool.query('DELETE FROM hamburguesas WHERE idHamburguesa = ?', [hamburguesaId]);
            return hamburguesaToDelete;
        } catch (error: any) {
            throw new Error(error.message || 'Error al eliminar la hamburguesa');
        }
    }
    public async getPrecioById(idHamburguesa: number): Promise<number | undefined> {
        const [precios] = await pool.query<RowDataPacket[]>(
            "SELECT precio FROM precios WHERE idHamburguesa = ? ORDER BY fechaVigencia DESC LIMIT 1",
            [idHamburguesa]
        );
    
        if (precios.length === 0) {
            return undefined; // No se encontró precio
        }
    
        return precios[0].precio; // Devuelve el precio más reciente
    }
}
