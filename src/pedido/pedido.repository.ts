import { Repository } from "../shared/repository.js";
import { Pedido } from "./pedido.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class PedidoRepository implements Repository<Pedido> {
    public async findAll(): Promise<Pedido[] | undefined> {
        const [pedidos] = await pool.query<RowDataPacket[]>(`
            SELECT ped.*, 
                   GROUP_CONCAT(hp.idHamburguesa) AS hamburguesasIds,
                   GROUP_CONCAT(h.nombre) AS hamburguesasNombres
            FROM pedidos ped 
            LEFT JOIN hamburguesas_pedidos hp ON hp.idPedido = ped.idPedido
            LEFT JOIN hamburguesas h ON h.idHamburguesa = hp.idHamburguesa
            GROUP BY ped.idPedido
        `);

        return pedidos.map(row => ({
            ...row,
            hamburguesas: row.hamburguesasIds ? row.hamburguesasIds.split(',').map((id: string, index: number) => ({
                idHamburguesa: parseInt(id, 10),
                nombre: row.hamburguesasNombres.split(',')[index]
            })) : []
        })) as Pedido[];
    }

    public async findOne(item: { id: string }): Promise<Pedido | undefined> {
        const id = Number.parseInt(item.id);
        const [pedidos] = await pool.query<RowDataPacket[]>(`
            SELECT ped.*, 
                   GROUP_CONCAT(hp.idHamburguesa) AS hamburguesasIds,
                   GROUP_CONCAT(h.nombre) AS hamburguesasNombres
            FROM pedidos ped 
            LEFT JOIN hamburguesas_pedidos hp ON hp.idPedido = ped.idPedido
            LEFT JOIN hamburguesas h ON h.idHamburguesa = hp.idHamburguesa
            WHERE ped.idPedido = ?
            GROUP BY ped.idPedido
        `, [id]);

        if (pedidos.length === 0) return undefined;

        const pedido = pedidos[0];
        pedido.hamburguesas = pedido.hamburguesasIds ? pedido.hamburguesasIds.split(',').map((id: string, index: number) => ({
            idHamburguesa: parseInt(id, 10),
            nombre: pedido.hamburguesasNombres.split(',')[index]
        })) : [];
        
        return pedido as Pedido;
    }







    public async add(pedidoInput: Pedido): Promise<Pedido | undefined>{ ///puede ser la funct de sanitize
        const{idPedido, ...pedidoRow} = pedidoInput
        const [result] = await pool.query<ResultSetHeader> ('insert into pedidos set ?', [pedidoRow])
        pedidoInput.idPedido = result.insertId
        return pedidoInput;

    }
    public async update(id:string, pedidoInput:Pedido): Promise<Pedido | undefined> {
        const pedidoId= Number.parseInt(id)
        const {idPedido, ...pedidoRow} = pedidoInput
        await pool.query ('update pedidos set? where idPedido=?', [pedidoRow, pedidoId])
        return await this.findOne({id})
        }
    public async delete(item: { id: string }): Promise<Pedido | undefined> {
        try {
            const pedidoToDelete = await this.findOne(item);
            const pedidoId = Number.parseInt(item.id);

            if (!pedidoToDelete) {
                throw new Error("Pedido no encontrado");
            }

            // Eliminar el pedido y sus relaciones
            await pool.query('DELETE FROM hamburguesas_pedido WHERE idPedido = ?', [pedidoId]);
            await pool.query('DELETE FROM pedidos WHERE idPedido = ?', [pedidoId]);

            return pedidoToDelete;
        } catch (error: any) {
            throw new Error('Unable to delete pedido');
        }
    }
}
