import { Router } from "express";
import { findLatest, add } from "./delivery.controler.js";
import { adminMiddleware } from "../middleware/auth.js";

console.log("delivery.routes cargado");
export const deliveryRouter = Router();

deliveryRouter.get("/", findLatest);                    
deliveryRouter.post("/", adminMiddleware, add);        