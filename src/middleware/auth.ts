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

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. Se requiere autenticación de administrador." });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (decoded.rol !== 'admin') {
            return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
        }
        (req as any).admin = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Token inválido." });
    }
}