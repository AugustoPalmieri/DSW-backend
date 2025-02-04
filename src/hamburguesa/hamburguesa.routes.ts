import { Router } from "express";
import { sanitizeHamburguesaInput, upload, findAll, findOne, add, update, remove } from "./hamburguesa.controler.js";

export const hamburguesaRouter = Router();

hamburguesaRouter.get("/", findAll);
hamburguesaRouter.get("/:idHamburguesa", findOne);
hamburguesaRouter.post("/", upload.single("imagen"), sanitizeHamburguesaInput, add); 
hamburguesaRouter.put("/:idHamburguesa", upload.single("imagen"), sanitizeHamburguesaInput, update); 
hamburguesaRouter.delete("/:idHamburguesa", remove);
