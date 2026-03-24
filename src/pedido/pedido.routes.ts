import { Router } from "express";
import { sanitizePedidoInput, findAll, findOne, add, update, remove, updateEstado } from "./pedido.controler.js";
import { adminMiddleware, authMiddleware } from "../middleware/auth.js";

export const pedidoRouter = Router();

pedidoRouter.get("/", adminMiddleware, findAll);
pedidoRouter.get("/:idPedido", authMiddleware, findOne);
pedidoRouter.post("/", sanitizePedidoInput, add);                         
pedidoRouter.put("/:idPedido", authMiddleware, sanitizePedidoInput, update);
pedidoRouter.delete("/:idPedido", adminMiddleware, remove);
pedidoRouter.put("/:idPedido/estado", adminMiddleware, sanitizePedidoInput, updateEstado);
