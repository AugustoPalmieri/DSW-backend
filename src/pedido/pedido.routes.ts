import { Router } from "express";
import { sanitizePedidoInput, findAll, findOne, add, update, remove, updateEstado } from "./pedido.controler.js";

export const pedidoRouter = Router();

pedidoRouter.get('/', findAll);
pedidoRouter.get('/:idPedido', findOne);
pedidoRouter.post('/', sanitizePedidoInput, add);
pedidoRouter.put('/:idPedido', sanitizePedidoInput, update);
pedidoRouter.delete('/:idPedido', remove);
pedidoRouter.put('/idPedido/estado', updateEstado); // Ruta específica para actualizar el estado
