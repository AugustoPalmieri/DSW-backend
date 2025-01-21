import { Router } from "express";
import { sanitizeHamburguesaInput, upload, findAll, findOne, add, update, remove } from "./hamburguesa.controler.js";

export const hamburguesaRouter = Router();

hamburguesaRouter.get("/", findAll);
hamburguesaRouter.get("/:idHamburguesa", findOne);
hamburguesaRouter.post("/", upload.single("imagen"), sanitizeHamburguesaInput, add); // Manejar carga de imagen
hamburguesaRouter.put("/:idHamburguesa", upload.single("imagen"), sanitizeHamburguesaInput, update); // Manejar carga de imagen
hamburguesaRouter.delete("/:idHamburguesa", remove);
