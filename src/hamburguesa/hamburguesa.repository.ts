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
            "SELECT idHamburguesa, nombre, descripcion, imagen FROM hamburguesas WHERE idHamburguesa = ?",
            [id]
        );
        if (hamburguesas.length === 0) return undefined;
        return hamburguesas[0] as Hamburguesa;
    }

    public async add(HamburguesaInput: Hamburguesa): Promise<Hamburguesa | undefined> {
        const { idHamburguesa, precio, ingredientes, ...hamburguesaRow } = HamburguesaInput as any;

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

        // Insertar ingredientes si vienen
        if (ingredientes && ingredientes.length > 0) {
            await this.updateIngredientes(HamburguesaInput.idHamburguesa!, ingredientes);
        }

        return HamburguesaInput;
    }

    public async update(id: string, hamburguesaInput: any): Promise<Hamburguesa | undefined> {
        const hamburguesaId = Number.parseInt(id);
        const { precio, ingredientes, ...hamburguesaRow } = hamburguesaInput;

        await pool.query("UPDATE hamburguesas SET ? WHERE idHamburguesa = ?", [
            hamburguesaRow,
            hamburguesaId,
        ]);

        if (precio !== undefined) {
            const fechaVigencia = new Date().toISOString().split('T')[0];
            const [existingPrice] = await pool.query<RowDataPacket[]>(
                "SELECT * FROM precios WHERE idHamburguesa = ? AND fechaVigencia = ?",
                [hamburguesaId, fechaVigencia]
            );
            if (existingPrice.length > 0) {
                await pool.query(
                    "UPDATE precios SET precio = ? WHERE idHamburguesa = ? AND fechaVigencia = ?",
                    [precio, hamburguesaId, fechaVigencia]
                );
            } else {
                await pool.query(
                    "INSERT INTO precios (idHamburguesa, fechaVigencia, precio) VALUES (?, ?, ?)",
                    [hamburguesaId, fechaVigencia, precio]
                );
            }
        }

        // Actualizar ingredientes si vienen
        if (ingredientes !== undefined) {
            await this.updateIngredientes(hamburguesaId, ingredientes);
        }

        return await this.findOne({ id });
    }

    public async delete(item: { id: string }): Promise<Hamburguesa | undefined> {
        try {
            const hamburguesaToDelete = await this.findOne(item);
            if (!hamburguesaToDelete) return undefined;
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
        if (precios.length === 0) return undefined;
        return precios[0].precio;
    }

    // ── Ingredientes de hamburguesa ───────────────────────────────────────────

    public async getIngredientes(idHamburguesa: number): Promise<any[]> {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT ih.codIngrediente, i.descripcion, ih.cantidad, i.stock
            FROM ingredientes_hamburguesa ih
            JOIN ingredientes i ON ih.codIngrediente = i.codIngrediente
            WHERE ih.idHamburguesa = ?
        `, [idHamburguesa]);
        return rows;
    }

    public async updateIngredientes(idHamburguesa: number, ingredientes: { codIngrediente: number, cantidad: number }[]): Promise<void> {
        // Eliminar ingredientes actuales y reemplazar
        await pool.query('DELETE FROM ingredientes_hamburguesa WHERE idHamburguesa = ?', [idHamburguesa]);

        if (ingredientes.length > 0) {
            const values = ingredientes.map(i => [idHamburguesa, i.codIngrediente, i.cantidad]);
            await pool.query(
                'INSERT INTO ingredientes_hamburguesa (idHamburguesa, codIngrediente, cantidad) VALUES ?',
                [values]
            );
        }
    }

    // ── Validar y descontar stock ─────────────────────────────────────────────

    public async validarStock(hamburguesas: { idHamburguesa: number, cantidad: number }[]): Promise<{ valido: boolean, faltantes: string[] }> {
        const faltantes: string[] = [];

        for (const h of hamburguesas) {
            const [ingredientes] = await pool.query<RowDataPacket[]>(`
                SELECT ih.codIngrediente, i.descripcion, ih.cantidad as cantPorHamburguesa, i.stock
                FROM ingredientes_hamburguesa ih
                JOIN ingredientes i ON ih.codIngrediente = i.codIngrediente
                WHERE ih.idHamburguesa = ?
            `, [h.idHamburguesa]);

            for (const ing of ingredientes) {
                const stockNecesario = ing.cantPorHamburguesa * h.cantidad;
                if (ing.stock < stockNecesario) {
                    faltantes.push(`${ing.descripcion} (necesario: ${stockNecesario}, disponible: ${ing.stock})`);
                }
            }
        }

        return { valido: faltantes.length === 0, faltantes };
    }

    public async descontarStock(hamburguesas: { idHamburguesa: number, cantidad: number }[]): Promise<void> {
        for (const h of hamburguesas) {
            const [ingredientes] = await pool.query<RowDataPacket[]>(`
                SELECT ih.codIngrediente, ih.cantidad as cantPorHamburguesa
                FROM ingredientes_hamburguesa ih
                WHERE ih.idHamburguesa = ?
            `, [h.idHamburguesa]);

            for (const ing of ingredientes) {
                const cantidadADescontar = ing.cantPorHamburguesa * h.cantidad;
                await pool.query(
                    'UPDATE ingredientes SET stock = stock - ? WHERE codIngrediente = ?',
                    [cantidadADescontar, ing.codIngrediente]
                );
            }
        }
    }
}