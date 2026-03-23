import { Router } from "express";
import { sanitizeHamburguesaInput, upload, findAll, findOne, getIngredientes, add, update, remove } from "./hamburguesa.controler.js";
import { adminMiddleware } from "../middleware/auth.js";

export const hamburguesaRouter = Router();

hamburguesaRouter.get("/", findAll);
hamburguesaRouter.get("/:idHamburguesa", findOne);
hamburguesaRouter.get("/:idHamburguesa/ingredientes", getIngredientes);
hamburguesaRouter.post("/", adminMiddleware, upload.single("imagen"), sanitizeHamburguesaInput, add);
hamburguesaRouter.put("/:idHamburguesa", adminMiddleware, upload.single("imagen"), sanitizeHamburguesaInput, update);
hamburguesaRouter.delete("/:idHamburguesa", adminMiddleware, remove);