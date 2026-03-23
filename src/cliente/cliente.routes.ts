import { Router } from "express";
import { sanitizeClienteInput, findAll, findOne, add, addRapido, update, remove, findByEmail, login } from "./cliente.controler.js";
import { adminMiddleware, authMiddleware } from "../middleware/auth.js";
import { sendCode, verifyCode, resetPassword } from "./password-reset.controller.js";

export const clienteRouter = Router();

clienteRouter.post("/login", login);
clienteRouter.post("/", sanitizeClienteInput, add);
clienteRouter.post("/reset-password/send-code", sendCode);
clienteRouter.post("/reset-password/verify-code", verifyCode);
clienteRouter.post("/reset-password/reset", resetPassword);

clienteRouter.post("/registro-rapido", adminMiddleware, addRapido);
clienteRouter.get("/", adminMiddleware, findAll);
clienteRouter.get("/email/:email", adminMiddleware, findByEmail);
clienteRouter.delete("/:idCliente", adminMiddleware, remove);

clienteRouter.get("/:idCliente", authMiddleware, findOne);
clienteRouter.put("/:idCliente", authMiddleware, sanitizeClienteInput, update);
clienteRouter.patch("/:idCliente", authMiddleware, sanitizeClienteInput, update);