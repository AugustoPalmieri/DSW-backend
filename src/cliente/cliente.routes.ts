import { Router } from "express";
import { sanitizeClienteInput, findAll, findOne, add, update, remove,findByEmail,login } from "./cliente.controler.js";

export const clienteRouter = Router()

clienteRouter.get('/', findAll)
clienteRouter.get('/:idCliente', findOne)
clienteRouter.get('/email/:email', findByEmail);
clienteRouter.post('/', sanitizeClienteInput, add)
clienteRouter.put('/:idCliente', sanitizeClienteInput,update)
clienteRouter.patch('/:idCliente', sanitizeClienteInput, update)
clienteRouter.delete('/:idCliente',remove)
clienteRouter.post("/login", login);