import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from "../shared/db/conn.mysql.js";
import transporter from '../mailService.js';

export const enviarCodigo = async (req: Request, res: Response) => {
  const adminEmail = 'hamburgueseriautn@gmail.com';
  
  try {
    const codigo = crypto.randomInt(100000, 999999);
    const query = 'UPDATE administradores SET codigo = ? WHERE email = ?';
    await pool.execute(query, [codigo, adminEmail]);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Código de Verificación',
      text: `Tu código de verificación es: ${codigo}`,
    });

    res.status(200).json({ success: true, message: 'Código enviado al correo.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al enviar el código.' });
  }
};

export const verificarCodigo = async (req: Request, res: Response) => {
  const { codigo } = req.body;
  const adminEmail = 'hamburgueseriautn@gmail.com';

  try {
    const query = 'SELECT * FROM administradores WHERE email = ? AND codigo = ?';
    const [results]: any = await pool.execute(query, [adminEmail, codigo]);

    if (results.length > 0) {
      const clearQuery = 'UPDATE administradores SET codigo = NULL WHERE email = ?';
      await pool.execute(clearQuery, [adminEmail]);

      const token = jwt.sign(
        { email: adminEmail, rol: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
      );

      res.status(200).json({ 
        success: true, 
        message: 'Código verificado correctamente.',
        token
      });
    } else {
      res.status(400).json({ success: false, message: 'Código inválido.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al verificar el código.' });
  }
};