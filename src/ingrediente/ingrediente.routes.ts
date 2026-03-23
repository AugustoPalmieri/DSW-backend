import { Router } from "express";
import { sanitizeIngredienteInput, findAll, findOne, add, update, remove } from "./ingrediente.controler.js";
import { adminMiddleware } from "../middleware/auth.js";

export const ingredienteRouter = Router();

ingredienteRouter.get("/", findAll);
ingredienteRouter.get("/:codIngrediente", findOne);
ingredienteRouter.post("/", adminMiddleware, sanitizeIngredienteInput, add);
ingredienteRouter.put("/:codIngrediente", adminMiddleware, sanitizeIngredienteInput, update);
ingredienteRouter.patch("/:codIngrediente", adminMiddleware, sanitizeIngredienteInput, update);
ingredienteRouter.delete("/:codIngrediente", adminMiddleware, remove);