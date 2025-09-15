import { Router } from "express";
import { sanitizeClienteInput, findAll, findOne, add, update, remove,findByEmail,login } from "./cliente.controler.js";
import { sendCode, verifyCode, resetPassword } from "./password-reset.controller.js";

export const clienteRouter = Router()

clienteRouter.get('/', findAll)
clienteRouter.get('/email/:email', findByEmail);
clienteRouter.get('/:idCliente', findOne)
clienteRouter.post('/', sanitizeClienteInput, add)
clienteRouter.put('/:idCliente', sanitizeClienteInput,update)
clienteRouter.patch('/:idCliente', sanitizeClienteInput, update)
clienteRouter.delete('/:idCliente',remove)
clienteRouter.post("/login", login);
clienteRouter.post("/reset-password/send-code", sendCode);
clienteRouter.post("/reset-password/verify-code", verifyCode);
clienteRouter.post("/reset-password/reset", resetPassword);