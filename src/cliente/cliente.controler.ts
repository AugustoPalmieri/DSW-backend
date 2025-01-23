import { Request, Response, NextFunction } from "express"
import { ClienteRepository } from "./cliente.repository.js"
import { Cliente } from "./cliente.entity.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
const repository = new ClienteRepository()

function sanitizeClienteInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedData ={
        idCliente: req.body.idCliente,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        telefono: req.body.telefono,
        email: req.body.email,
        direccion: req.body.direccion
    }
    next()
}

async function findAll(req:Request,res:Response){
    res.json({data:await repository.findAll()})
}

async function findOne(req:Request,res: Response){
    const cliente = await repository.findOne({id:req.params.idCliente}) 
    if(!cliente){
        return res.status(404).send({message: 'Cliente Not Found'})
    }
    res.json(cliente)
}

async function add(req: Request, res: Response){
    const data= req.body.sanitizedData
    const clienteData = new Cliente(data.nombre, data.apellido,data.telefono, data.email,data.direccion,data.passwordHash)
    const cliente = await repository.add(clienteData)
    return res.status(201).send({message: 'CLIENTE CREADO', data: cliente})
}  


async function update(req: Request, res: Response){ 
    req.body.sanitizedData.idCliente = req.params.idCliente
    const cliente = await repository.update(req.params.idCliente, req.body.sanitizedData) ///puede ser id
    if(!cliente){
        return res.status(404).send({message: 'Cliente Not Found'})
    }
    return res.status(200).send({message: 'CLIENTE MODIFICADO CORRECTAMENTE', data:cliente})
}


async function remove(req: Request,res: Response){
    const id = req.params.idCliente //puede ser id
    const cliente =await repository.delete({id})
    if(!cliente){
        res.status(404).send({message: 'Cliente Not Found'})
    } else{
        res.status(200).send({message: 'CLIENTE ELIMINADO CORRECTAMENTE'})
    } 
}
async function findByEmail(req: Request, res: Response) {
        const email = req.params.email;
        const cliente = await repository.findByEmail(email);
        if (!cliente) {
            return res.status(404).send({ message: 'Cliente Not Found' });
        }
        res.json(cliente);
    }

    async function register(req: Request, res: Response) {
        const { nombre, apellido, telefono, email, direccion, password } = req.body;
    
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
    
        // Verificar si el email ya está registrado
        const clienteExistente = await repository.findByEmail(email);
        if (clienteExistente) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }
    
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        // Crear nuevo cliente
        const nuevoCliente = new Cliente(
            nombre,
            apellido,
            telefono,
            email,
            direccion,
            hashedPassword
        );
    
        const clienteCreado = await repository.add(nuevoCliente);
        res.status(201).json({ message: "Usuario registrado exitosamente", data: clienteCreado });
    }
    
    async function login(req: Request, res: Response) {
        const { email, password } = req.body;
    
        if (!email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
    
        // Verificar si el usuario existe
        const cliente = await repository.findByEmail(email);
        if (!cliente) {
            return res.status(400).json({ error: "Credenciales inválidas" });
        }
    
        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, cliente.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: "Credenciales inválidas" });
        }
        console.log(process.env.JWT_SECRET)
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "La clave secreta no está definida en el entorno" });
        }
         const token = jwt.sign(
            { idCliente: cliente.idCliente, email: cliente.email },
            process.env.JWT_SECRET,  // Usar la clave secreta del entorno
            { expiresIn: "1h" }
        );
    
        res.status(200).json({ token, message: "Inicio de sesión exitoso" });
    }
export{sanitizeClienteInput, findAll, findOne,add, update, remove,findByEmail,register,login};