import { Repository } from "../shared/repository.js";
import { Cliente } from "./cliente.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";



export class ClienteRepository implements Repository<Cliente>{
    public async findAll(): Promise< Cliente[]| undefined>  {
        const [clientes] = await pool.query('select * from clientes')
        return clientes as Cliente[]  
    }
    public async findOne(item: { id: string }): Promise< Cliente | undefined> {
        const id = Number.parseInt(item.id)
        const [clientes] = await pool.query<RowDataPacket[]>('select * from clientes where idCliente = ?', [id])
        if(clientes.length === 0){
            return undefined
        }
        const cliente = clientes[0] as Cliente
        return cliente
    }

    public async add(clienteInput: Cliente): Promise<Cliente | undefined> {
        const {idCliente,...clienteRow}=clienteInput
        const [result]= await pool.query<ResultSetHeader>('INSERT INTO clientes SET ?', [clienteRow])
        clienteInput.idCliente=result.insertId
        return clienteInput
    }
    public async update(id:string, clienteInput:Cliente): Promise<Cliente | undefined> {
        const clienteId= Number.parseInt(id)
        const {idCliente, ...clienteRow} = clienteInput
        await pool.query ('update clientes set? where idCliente =?', [clienteRow, clienteId])
        return await this.findOne({id})

    }
    public async delete(item: { id: string; }): Promise<Cliente | undefined>{
        try{
            const ClienteToDelete = await this.findOne(item)
            const clienteId= Number.parseInt(item.id)
            await pool.query('delete from clientes where idCliente =?', clienteId)
            return ClienteToDelete
        } catch(error: any) {
            throw new Error('unable to delete Cliente')
        }
    }
    public async findByEmail(email: string): Promise<Cliente | undefined> {
        const [clientes] = await pool.query<RowDataPacket[]>('SELECT * FROM clientes WHERE email = ?', [email]);
        if (clientes.length === 0) {
            return undefined;
        }
        const cliente = clientes[0] as Cliente;
        return cliente;
    }
}   