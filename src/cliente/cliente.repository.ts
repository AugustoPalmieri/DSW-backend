import { Repository } from "../shared/repository.js";
import { Cliente } from "./cliente.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";



export class ClienteRepository implements Repository<Cliente>{
    public async findAll(): Promise< Cliente[]| undefined>  {
        const [clientes] = await pool.query('select * from clientes')
        return clientes as Cliente[]  
    }
    public async findOne(item: { id: string }): Promise<Cliente | undefined> {
        const id = Number.parseInt(item.id);
    
        if (isNaN(id)) {
            throw new Error('ID no válido');  // Lanza un error si el ID no es un número
        }
        const [clientes] = await pool.query<RowDataPacket[]>('select * from clientes where idCliente = ?', [id]);
        if (clientes.length === 0) {
            return undefined;
        }
    
        const cliente = clientes[0] as Cliente;
        return cliente;
    }

    public async add(clienteInput: Cliente): Promise<Cliente | undefined> {
        const {idCliente,...clienteRow}=clienteInput
        const [result]= await pool.query<ResultSetHeader>('INSERT INTO clientes SET ?', [clienteRow])
        clienteInput.idCliente=result.insertId
        return clienteInput
    }
    public async update(id: string, clienteInput: Cliente): Promise<Cliente | undefined> {
        try {
            const clienteId = Number.parseInt(id);
            const { idCliente, passwordHash, ...clienteRow } = clienteInput;
    
            console.log('Datos enviados para actualizar:', clienteRow, 'passwordHash:', passwordHash);
    
            if (passwordHash) {
                // Actualiza con el nuevo hash de la contraseña
                await pool.query(
                    'UPDATE clientes SET ? WHERE idCliente = ?',
                    [{ ...clienteRow, passwordHash }, clienteId]
                );
            } else {
                // Actualiza sin modificar la contraseña
                await pool.query('UPDATE clientes SET ? WHERE idCliente = ?', [clienteRow, clienteId]);
            }
    
            return await this.findOne({ id });
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
            throw new Error('No se pudo actualizar el cliente');
        }
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
        console.log('Clientes encontrados:', clientes); // Verifica los datos obtenidos
        if (clientes.length === 0) {
            return undefined;
        }
        const cliente = clientes[0] as Cliente;
        return cliente;
    }
}   