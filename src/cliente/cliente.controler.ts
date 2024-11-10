import { Request, Response, NextFunction } from "express"
import { ClienteRepository } from "./cliente.repository.js"
import { Cliente } from "./cliente.entity.js"
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
    const clienteData = new Cliente(data.nombre, data.apellido,data.telefono, data.email,data.direccion)
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


export{sanitizeClienteInput, findAll, findOne,add, update, remove,findByEmail};