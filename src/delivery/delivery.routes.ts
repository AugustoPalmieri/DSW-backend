import { Router } from "express";
import { findLatest, add } from "./delivery.controler.js"; // <--- CORREGIDO
console.log("delivery.routes cargado"); 
export const deliveryRouter = Router();

deliveryRouter.get("/", findLatest);
deliveryRouter.post("/", add);