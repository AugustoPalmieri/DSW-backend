import { Repository } from "../shared/repository.js";
import { Pedido } from "./pedido.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PrecioRepository } from "../precio/precio.repository.js";

const precioRepository = new PrecioRepository();

export class PedidoRepository implements Repository<Pedido> {
    static update(idPedido: string, pedidoEnter: Pedido) {
        throw new Error("Method not implemented.");
    }
    public async findAll(): Promise<Pedido[] | undefined> {
        const [pedidos] = await pool.query<RowDataPacket[]>(`
            SELECT ped.*, 
                   GROUP_CONCAT(hp.idHamburguesa) AS hamburguesasIds,
                   GROUP_CONCAT(h.nombre) AS hamburguesasNombres,
                   GROUP_CONCAT(hp.cantidad) AS hamburguesasCantidades
            FROM pedidos ped 
            LEFT JOIN hamburguesas_pedidos hp ON hp.idPedido = ped.idPedido
            LEFT JOIN hamburguesas h ON h.idHamburguesa = hp.idHamburguesa
            GROUP BY ped.idPedido
        `);
    
        const pedidosConMontoTotal = await Promise.all(
            pedidos.map(async row => {
                const hamburguesas = row.hamburguesasIds ? row.hamburguesasIds.split(',').map((id: string, index: number) => ({
                    idHamburguesa: parseInt(id, 10),
                    nombre: row.hamburguesasNombres.split(',')[index],
                    cantidad: parseInt(row.hamburguesasCantidades.split(',')[index], 10)
                })) : [];

                
                let montoTotal = 0;
                for (const hamburguesa of hamburguesas) {
                    const precio = await precioRepository.getPrecioActual(hamburguesa.idHamburguesa);
                    if (precio) {
                        montoTotal += precio * hamburguesa.cantidad;
                    }
                }

                return {
                    ...row,
                    hamburguesas,
                    montoTotal
                } as Pedido;
            })
        );

        return pedidosConMontoTotal;
    }

    public async findOne(item: { id: string }): Promise<Pedido | undefined> {
        const id = Number.parseInt(item.id);
        const [pedidos] = await pool.query<RowDataPacket[]>(`
            SELECT ped.*, 
                   GROUP_CONCAT(hp.idHamburguesa) AS hamburguesasIds,
                   GROUP_CONCAT(h.nombre) AS hamburguesasNombres,
                   GROUP_CONCAT(hp.cantidad) AS hamburguesasCantidades
            FROM pedidos ped 
            LEFT JOIN hamburguesas_pedidos hp ON hp.idPedido = ped.idPedido
            LEFT JOIN hamburguesas h ON h.idHamburguesa = hp.idHamburguesa
            WHERE ped.idPedido = ?
            GROUP BY ped.idPedido
        `, [id]);
    
        if (pedidos.length === 0) return undefined;
    
        const pedido = pedidos[0];
        const hamburguesas = pedido.hamburguesasIds ? pedido.hamburguesasIds.split(',').map((id: string, index: number) => ({
            idHamburguesa: parseInt(id, 10),
            nombre: pedido.hamburguesasNombres.split(',')[index],
            cantidad: parseInt(pedido.hamburguesasCantidades.split(',')[index], 10)
        })) : [];

        
        let montoTotal = 0;
        for (const hamburguesa of hamburguesas) {
            const precio = await precioRepository.getPrecioActual(hamburguesa.idHamburguesa);
            if (precio) {
                montoTotal += precio * hamburguesa.cantidad;
            }
        }

        return {
            ...pedido,
            hamburguesas,
            montoTotal
        } as Pedido;
    }

    public async add(pedidoInput: Pedido): Promise<Pedido | undefined> {
        let montoTotal = 0;
        const hamburguesas = pedidoInput.hamburguesas || [];

        for (const hamburguesa of hamburguesas) {
            const precio = await precioRepository.getPrecioActual(hamburguesa.idHamburguesa);
            if (precio) {
                montoTotal += precio * hamburguesa.cantidad;
            }
        }

        const pedidoRow = {
            modalidad: pedidoInput.modalidad,
            montoTotal,
            estado: pedidoInput.estado,
            idCliente: pedidoInput.idCliente
        };

        
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO pedidos SET ?', pedidoRow);
        pedidoInput.idPedido = result.insertId;

        
        const hamburguesaPedidos = hamburguesas.map(h => [result.insertId, h.idHamburguesa, h.cantidad]);

        const query = 'INSERT INTO hamburguesas_pedidos (idPedido, idHamburguesa, cantidad) VALUES ?';
        await pool.query(query, [hamburguesaPedidos]);
        return pedidoInput;
    }
    
    public async update(id: string, pedidoInput: Pedido): Promise<Pedido | undefined> {
        const pedidoId = Number.parseInt(id);
    
        if (isNaN(pedidoId)) {
            throw new Error('ID del pedido no es válido');
        }
    
        let montoTotal = 0;
        const hamburguesas = pedidoInput.hamburguesas || [];
    
        if (!hamburguesas || hamburguesas.length === 0) {
            throw new Error('No se pueden actualizar pedidos sin hamburguesas');
        }
    
        for (const hamburguesa of hamburguesas) {
            const precio = await precioRepository.getPrecioActual(hamburguesa.idHamburguesa);
            if (precio) {
                montoTotal += precio * hamburguesa.cantidad;
            }
        }
    
        // Asegurarse de solo pasar los datos necesarios a la consulta
        const pedidoRow = {
            modalidad: pedidoInput.modalidad,
            montoTotal,
            estado: pedidoInput.estado,
            idCliente: pedidoInput.idCliente  // Asegúrate de incluir cualquier campo necesario
        };
    
        // Depuración: Verifica el contenido de pedidoRow
        
    
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
    
            // Aquí se pasa solo el objeto 'pedidoRow', asegurándonos de que no sea un objeto complejo
            const [result] = await connection.query('UPDATE pedidos SET ? WHERE idPedido = ?', [pedidoRow, pedidoId]);
    
            if ((result as any).affectedRows === 0) {
                throw new Error('No se encontró el pedido para actualizar');
            }
    
            // Borra las hamburguesas anteriores y las vuelve a insertar
            await connection.query('DELETE FROM hamburguesas_pedidos WHERE idPedido = ?', [pedidoId]);
    
            const hamburguesaPedidos = hamburguesas.map(h => [pedidoId, h.idHamburguesa, h.cantidad]);
            if (hamburguesaPedidos.length > 0) {
                await connection.query('INSERT INTO hamburguesas_pedidos (idPedido, idHamburguesa, cantidad) VALUES ?', [hamburguesaPedidos]);
            }
    
            await connection.commit();
            connection.release();
    
            return await this.findOne({ id });
        } catch (error: any) {
            await connection.rollback();
            connection.release();
            throw new Error(`Error al actualizar el pedido: ${error.message}`);
        }
    }

    public async delete(item: { id: string }): Promise<Pedido | undefined> {
        try {
            const pedidoToDelete = await this.findOne(item);
            const pedidoId = Number.parseInt(item.id);
    
            if (!pedidoToDelete) {
                throw new Error("Pedido no encontrado");
            }
    
            
            await pool.query('DELETE FROM hamburguesas_pedidos WHERE idPedido = ?', [pedidoId]);

            await pool.query('DELETE FROM pedidos WHERE idPedido = ?', [pedidoId]);
    
            return pedidoToDelete;
        } catch (error: any) {
            throw new Error('Unable to delete pedido');
        }
    }
    
    public async updateEstado(idPedido: string, estado: string) {
        try {
            const result = await pool.query(`
                UPDATE pedidos
                SET estado = ?
                WHERE idPedido = ?`, 
                [estado, idPedido]
            );
    
            // Verificar si se actualizó correctamente
    
            return { idPedido, estado };  // Devolver el estado actualizado
        } catch (error: any) {
            throw new Error(error.message);  // Manejo de errores
        }
    }
    }



