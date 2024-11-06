import { Request, Response } from 'express';
import { PrecioRepository } from './precio.repository.js';

const precioRepository = new PrecioRepository();

export const getPrecioActual = async (req: Request, res: Response) => {
    const { idHamburguesa } = req.params;
    const precioActual = await precioRepository.getPrecioActual(Number(idHamburguesa));

    if (precioActual !== null) {
        res.json(precioActual);
    } else {
        res.status(404).json({ message: "Precio no encontrado" });
    }
};
