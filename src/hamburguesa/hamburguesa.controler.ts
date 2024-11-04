import { Request, Response, NextFunction} from "express"
import { HamburguesaRepository } from "./hamburguesa.repository.js"
import { Hamburguesa } from "./hamburguesa.entity.js"


const repository_2 = new HamburguesaRepository()


function sanitizeHamburguesaInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput ={
        idHamburguesa: req.body.idHamburguesa,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
    }
    next()
}

async function findAll(req:Request,res:Response){
    res.json({data: await repository_2.findAll()})
}

async function findOne(req:Request,res: Response){
    const hamburguesa =await repository_2.findOne({id:req.params.idHamburguesa}) 
    if(!hamburguesa){
        res.status(404).send({message: 'Hamburguesa Not Found'})
    }
    res.json(hamburguesa)
}

async function add(req:Request, res:Response){
    const data= req.body.sanitizedInput
    const hamburguesaInput = new Hamburguesa(data.nombre,data.descripcion)
    const hamburguesa = await repository_2.add(hamburguesaInput)
    return res.status(201).send({message: 'HAMBURGUESA CREADA', data: hamburguesa})
}

async function update(req: Request,res:Response){
    req.body.sanitizedInput.idHamburguesa = req.params.idHamburguesa 
    const hamburguesa =await repository_2.update(req.params.idHamburguesa, req.body.sanitizedInput) //puede ser id
    if(!hamburguesa){
        return res.status(404).send({message: 'Hamburguesa Not Found'})
    }
    return res.status(200).send({message: 'HAMBURGUESA MODIFICADA CORRECTAMENTE', data: hamburguesa})

}

async function remove(req:Request,res: Response){
    const id = req.params.idHamburguesa
    const hamburguesa = await repository_2.delete({id})
    if(!hamburguesa){
        res.status(404).send({message: 'Hamburguesa Not Found'})
    } else{
        res.status(200).send({message: 'HAMBURGUESA ELIMINADA CORRECTAMENTE'})
    }  
}

export{sanitizeHamburguesaInput, findAll, findOne, add,update, remove}


