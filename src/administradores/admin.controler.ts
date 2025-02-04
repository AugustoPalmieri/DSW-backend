import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../shared/db/conn.mysql.js';


// Obtener lista de administradores
export const ReadUser = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM administradores');
        res.json({
            msg: 'Lista de administradores encontrada exitosamente',
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            msg: 'Error al obtener los administradores',
            error
        });
    }
};

// Crear un nuevo administrador
export const CreateUser = async (req: Request, res: Response) => {
    const { nombre, apellido, password, email, telefono, direccion } = req.body;
    try {
        // Verificar si el email ya existe
        const [existingEmail]: any = await pool.query('SELECT * FROM administradores WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ msg: `El email ${email} ya está en uso.` });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo administrador
        await pool.query(
            'INSERT INTO administradores (nombre, apellido, password, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, hashedPassword, email, telefono, direccion]
        );

        res.json({ msg: `Administrador ${nombre} ${apellido} creado exitosamente.` });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear el administrador', error });
    }
};

// Login de administrador
export const LoginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Buscar el administrador por email
        const [rows]: any = await pool.query('SELECT * FROM administradores WHERE email = ?', [email]);
        const user = rows[0];
        
        if (!user) {
            return res.status(400).json({ msg: `No existe un administrador con el email ${email}` });
        }

        // Verificar la contraseña
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        // Generar un token
        const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY || 'TSE-Edaniel-Valencia', { expiresIn: '1h' });
        
        res.json({ token });
    } catch (error) {
        res.status(500).json({ msg: 'Error en el proceso de autenticación', error });
    }
};
