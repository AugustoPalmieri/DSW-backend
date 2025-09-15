import { Request, Response } from "express";
import { DeliveryRepository } from "../delivery/delivery.repository.js";
import { Delivery } from "../delivery/delivery.entity.js";

const repository = new DeliveryRepository();

async function findLatest(req: Request, res: Response) {
    const delivery = await repository.findLatest();
    if (!delivery) {
        return res.status(404).send({ message: "No hay configuración de delivery." });
    }
    res.json({ data: delivery });
}
console.log("Intentando insertar delivery:", Delivery);
async function add(req: Request, res: Response) {
    const { precio } = req.body;
    if (!precio) {
        return res.status(400).send({ message: "Falta el precio." });
    }
    const fechaActualizacion = new Date();
    const delivery = new Delivery(0, precio, fechaActualizacion);
    const result = await repository.add(delivery);
    res.status(201).send({ message: "Delivery creado", data: result });
}
export { findLatest, add };