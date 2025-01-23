import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Token inválido." });
    }
}
