import fs from "fs";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { HamburguesaRepository } from "./hamburguesa.repository.js";
import { Hamburguesa } from "./hamburguesa.entity.js";

const repository_2 = new HamburguesaRepository();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "./uploads";
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

function sanitizeHamburguesaInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        idHamburguesa: req.body.idHamburguesa,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        ingredientes: req.body.ingredientes ? JSON.parse(req.body.ingredientes) : undefined,
    };
    next();
}

async function findAll(req: Request, res: Response) {
    res.json({ data: await repository_2.findAll() });
}

async function findOne(req: Request, res: Response) {
    const hamburguesa = await repository_2.findOne({ id: req.params.idHamburguesa });
    if (!hamburguesa) return res.status(404).send({ message: "Hamburguesa Not Found" });
    res.json(hamburguesa);
}

async function getIngredientes(req: Request, res: Response) {
    try {
        const idHamburguesa = Number.parseInt(req.params.idHamburguesa);
        const ingredientes = await repository_2.getIngredientes(idHamburguesa);
        res.json({ data: ingredientes });
    } catch (error) {
        res.status(500).send({ message: "Error al obtener ingredientes" });
    }
}

async function add(req: Request, res: Response) {
    const data = req.body.sanitizedInput;
    const hamburguesaInput = new Hamburguesa(data.nombre, data.descripcion, data.precio);
    if (req.file?.filename) hamburguesaInput["imagen"] = req.file.filename;
    (hamburguesaInput as any).ingredientes = data.ingredientes;
    const hamburguesa = await repository_2.add(hamburguesaInput);
    return res.status(201).send({ message: "HAMBURGUESA CREADA", data: hamburguesa });
}

async function update(req: Request, res: Response) {
    req.body.sanitizedInput.idHamburguesa = req.params.idHamburguesa;
    if (req.file?.filename) req.body.sanitizedInput["imagen"] = req.file.filename;
    const hamburguesa = await repository_2.update(req.params.idHamburguesa, req.body.sanitizedInput);
    if (!hamburguesa) return res.status(404).send({ message: "Hamburguesa Not Found" });
    return res.status(200).send({ message: "HAMBURGUESA MODIFICADA CORRECTAMENTE", data: hamburguesa });
}

async function remove(req: Request, res: Response) {
    try {
        const hamburguesa = await repository_2.delete({ id: req.params.idHamburguesa });
        if (!hamburguesa) return res.status(404).send({ message: "Hamburguesa no encontrada" });
        res.status(200).send({ message: "HAMBURGUESA ELIMINADA CORRECTAMENTE" });
    } catch (error: any) {
        if (error.message === "HAMBURGUESA_EN_PEDIDO_EN_PROCESO") {
            res.status(400).send({ message: "NO SE PUEDE ELIMINAR LA HAMBURGUESA PORQUE ESTÁ EN UN PEDIDO \"EN PROCESO\"" });
        } else {
            res.status(500).send({ message: "Error al eliminar la hamburguesa" });
        }
    }
}

export { sanitizeHamburguesaInput, upload, findAll, findOne, getIngredientes, add, update, remove };