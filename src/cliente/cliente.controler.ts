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
        direccion: req.body.direccion,
        password:req.body.password,
        passwordHash:req.body.passwordHash||undefined,
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

async function add(req: Request, res: Response) {
    const { nombre, apellido, telefono, email, direccion, password } = req.body;
    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    const clienteExistente = await repository.findByEmail(email);
    if (clienteExistente) {
        return res.status(400).json({ error: "El email ya está registrado" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoCliente = new Cliente(
        nombre,
        apellido,
        telefono,
        email,
        direccion,
        hashedPassword
    );
    try {
        const clienteCreado = await repository.add(nuevoCliente);
        return res.status(201).json({ message: "Usuario registrado exitosamente", data: clienteCreado });
    } catch (error) {
        return res.status(500).json({ error: "Error al crear el cliente" });
    }
}


async function update(req: Request, res: Response) {
    const idCliente = req.params.idCliente;
    const sanitizedData = req.body.sanitizedData || req.body;

    // Si incluye "password", genera el hash y actualiza "passwordHash"
    if (sanitizedData.password) {
        const salt = await bcrypt.genSalt(10);
        sanitizedData.passwordHash = await bcrypt.hash(sanitizedData.password, salt);
        delete sanitizedData.password; // No almacenar la contraseña en texto plano
    }

    try {
        const cliente = await repository.update(idCliente, sanitizedData);

        if (!cliente) {
            return res.status(404).send({ message: 'Cliente Not Found' });
        }

        return res.status(200).send({ 
            message: 'CLIENTE MODIFICADO CORRECTAMENTE', 
            data: cliente 
        });
    } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        return res.status(500).send({ error: 'Error al actualizar el cliente' });
    }
}




async function remove(req: Request,res: Response){
    const id = req.params.idCliente 
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

    
    async function login(req: Request, res: Response) {
        const { email, password } = req.body;
    
        if (!email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
    
        try {
            const cliente = await repository.findByEmail(email);
            if (!cliente) {
                return res.status(400).json({ error: "Credenciales inválidas" });
            }
    
            // Comparar la contraseña ingresada con el passwordHash en la base de datos
            const isMatch = await bcrypt.compare(password, cliente.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ error: "Credenciales inválidas" });
            }
    
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ error: "La clave secreta no está definida en el entorno" });
            }
    
            // Generación del token
            const token = jwt.sign(
                { idCliente: cliente.idCliente, email: cliente.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
    
            // Devolver el token y el idCliente en la respuesta
            res.status(200).json({
                token,
                cliente: {
                    idCliente: cliente.idCliente, // Agregar idCliente en la respuesta
                    email: cliente.email          // Puedes agregar otros datos si lo deseas
                },
                message: "Inicio de sesión exitoso"
            });
        } catch (error) {
            console.error("Error al intentar iniciar sesión:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
    
    
    
export{sanitizeClienteInput, findAll, findOne,add, update, remove,findByEmail,login};