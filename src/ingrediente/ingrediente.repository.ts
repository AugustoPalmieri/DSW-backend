import { Repository } from "../shared/repository.js";
import { Ingrediente } from "./ingrediente.entity.js";
import { pool } from "../shared/db/conn.mysql.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";




export class IngredienteRepository implements Repository<Ingrediente> {
    public async findAll(): Promise< Ingrediente[]| undefined>  {
        const [ingredientes] = await pool.query('select * from ingredientes WHERE activo = TRUE')
        return ingredientes as Ingrediente[]  
        /*falta el for que se usa en el video api23 VER SI DEBERIAMOS USARLO NOSTROS
        for (const character of characters as Character[]) {
            const [items] = await pool.query('select itemName from characterItems where characterId = ?', [character.id])
            character.items = (items as { itemName: string }[]).map((item) => item.itemName) */
    }
    public async findOne(item: { id: string }): Promise< Ingrediente | undefined> {
        const id = Number.parseInt(item.id)
        const [ingredientes] = await pool.query<RowDataPacket[]>('select * from ingredientes where codIngrediente = ? AND activo = TRUE', [id])
        if(ingredientes.length === 0){
            return undefined
        }
        const ingrediente = ingredientes[0] as Ingrediente
        return ingrediente
    }
    public async add(ingredienteInput: Ingrediente): Promise<Ingrediente | undefined>{ 
        const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM ingredientes WHERE LOWER(descripcion) = LOWER(?) AND activo = TRUE',
        [ingredienteInput.descripcion.trim()]
    );
    if ((rows as RowDataPacket[]).length > 0) {
        throw new Error('Ya existe un ingrediente con ese nombre.');
    }
        const{codIngrediente, ...ingredienteRow} = ingredienteInput
        const [result] = await pool.query<ResultSetHeader> ('insert into ingredientes set ?', [ingredienteRow])
        ingredienteInput.codIngrediente = result.insertId
        return ingredienteInput;

    }
    public async update(id:string, ingredienteInput:Ingrediente): Promise<Ingrediente | undefined> {
        const ingredienteId= Number.parseInt(id)
        const {codIngrediente, ...ingredienteRow} = ingredienteInput
        await pool.query ('update ingredientes set? where codIngrediente=?', [ingredienteRow, ingredienteId])
        return await this.findOne({id})
 
    }
    public async delete(item: { id: string }): Promise<Ingrediente | undefined> {
        const ingredienteToDelete = await this.findOne(item);
        if (!ingredienteToDelete) return undefined;
        const ingredienteId = Number.parseInt(item.id);

        // Borrado lógico: marcar como inactivo para preservar relaciones con hamburguesas
        await pool.query('UPDATE ingredientes SET activo = FALSE WHERE codIngrediente = ?', [ingredienteId]);
        return ingredienteToDelete;
    }
    
    
    



}