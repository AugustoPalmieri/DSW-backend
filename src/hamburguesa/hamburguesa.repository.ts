import { Repository } from "../shared/repository.js";
import { Hamburguesa } from "./hamburguesa.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";



export class HamburguesaRepository implements Repository<Hamburguesa>{
    public async findAll(): Promise<Hamburguesa[] | undefined> {
        const [hamburguesas] = await pool.query('select * from hamburguesas')
        return hamburguesas as Hamburguesa[]
    }
    public async findOne(item: { id: string }): Promise< Hamburguesa | undefined> {
        const id = Number.parseInt(item.id)
        const [hamburguesas] = await pool.query<RowDataPacket[]>('select * from hamburguesas where idHamburguesa = ?', [id])
        if(hamburguesas.length === 0){
            return undefined
        }
        const hamburguesa = hamburguesas[0] as Hamburguesa
        return hamburguesa
    }
    public async add(HamburguesaInput: Hamburguesa): Promise<Hamburguesa | undefined> {
        const {idHamburguesa,...HamburguesaRow}=HamburguesaInput
        const [result]=await pool.query<ResultSetHeader> ('insert into hamburguesas set ?', [HamburguesaRow])
        HamburguesaInput.idHamburguesa=result.insertId
        return HamburguesaInput
    }
    public async update(id:string, hamburguesaInput:Hamburguesa): Promise<Hamburguesa | undefined> {
        const hamburguesaId= Number.parseInt(id)
        const {idHamburguesa, ...hamburguesaRow} = hamburguesaInput
        await pool.query ('update hamburguesas set? where idHamburguesa =?', [hamburguesaRow, hamburguesaId])
        return await this.findOne({id})
 
    }
    
    public async isHamburguesaInPedidoEnProceso(idHamburguesa: number): Promise<boolean> {
        const query = `
            SELECT p.estado
            FROM hamburguesas_pedidos hp
            INNER JOIN pedidos p ON hp.idPedido = p.idPedido
            WHERE hp.idHamburguesa = ? AND p.estado = 'En proceso' 
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query, [idHamburguesa]); 
    
        
        return rows && rows.length > 0;
    }
    public async delete(item: { id: string }): Promise<Hamburguesa | undefined> {
        try {
            const hamburguesaToDelete = await this.findOne(item);
            if (!hamburguesaToDelete) {
                return undefined;
            }
    
            const hamburguesaId = Number.parseInt(item.id);
    
            
            const isInPedidoEnProceso = await this.isHamburguesaInPedidoEnProceso(hamburguesaId);
            if (isInPedidoEnProceso) {
                throw new Error('HAMBURGUESA_EN_PEDIDO_EN_PROCESO');
            }
    
            await pool.query('DELETE FROM hamburguesas_pedidos WHERE idHamburguesa = ?', [hamburguesaId]);
    
            
            await pool.query('DELETE FROM precios WHERE idHamburguesa = ?', [hamburguesaId]);
    
            
            await pool.query('DELETE FROM ingredientes_hamburguesa WHERE idHamburguesa = ?', [hamburguesaId]);
    
            
            await pool.query('DELETE FROM hamburguesas WHERE idHamburguesa = ?', [hamburguesaId]);
    
            return hamburguesaToDelete;
        } catch (error: any) {
            if (error.message === 'HAMBURGUESA_EN_PEDIDO_EN_PROCESO') {
                throw new Error('La hamburguesa no se puede eliminar porque está en un pedido en proceso');
            }
            throw new Error(error.message || 'Error al eliminar la hamburguesa');
        }
    }

}