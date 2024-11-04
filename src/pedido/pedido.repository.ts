import { Repository } from "../shared/repository.js";
import { Pedido } from "./pedido.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class PedidoRepository implements Repository<Pedido> {
    public async findAll(): Promise<Pedido[] | undefined> {
        const [pedidos] = await pool.query('select * from pedidos ped inner join hamburguesas_pedidos hp on hp.idPedido = ped.idPedido inner join hamburguesas h on h.idHamburguesa = hp.idHamburguesa');
        return pedidos as Pedido[];
    }

    public async findOne(item: { id: string }): Promise<Pedido | undefined> {
        const id = Number.parseInt(item.id);
        const [pedidos] = await pool.query<RowDataPacket[]>('select * from pedidos where idPedido = ?', [id]);
        if (pedidos.length === 0) {
            return undefined;
        }
        const pedido = pedidos[0] as Pedido;
        return pedido;
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
