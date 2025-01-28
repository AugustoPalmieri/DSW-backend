import { Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from "../shared/db/conn.mysql.js";
import transporter from '../mailService.js';
export const enviarCodigo = async (req: Request, res: Response) => {
  const adminEmail = 'hamburgueseriautn@gmail.com'; 
  
  try {
    // Generar un código aleatorio de 6 dígitos
    const codigo = crypto.randomInt(100000, 999999);

    // Guardar el código en la base de datos
    const query = 'UPDATE administradores SET codigo = ? WHERE email = ?';
    await pool.execute(query, [codigo, adminEmail]);

    console.log('Email user:', process.env.EMAIL_USER); // Verifica si está cargando el correo
    console.log('Email pass:', process.env.EMAIL_PASSWORD); // Verifica si está cargando la contraseña

    // Enviar el correo
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
    // Consulta para verificar si el código es correcto
    const query = 'SELECT * FROM administradores WHERE email = ? AND codigo = ?';
    const [results]: any = await pool.execute(query, [adminEmail, codigo]);

    if (results.length > 0) {
      // Limpia el código después de verificarlo
      const clearQuery = 'UPDATE administradores SET codigo = NULL WHERE email = ?';
      await pool.execute(clearQuery, [adminEmail]);

      res.status(200).json({ success: true, message: 'Código verificado correctamente.' });
    } else {
      res.status(400).json({ success: false, message: 'Código inválido.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al verificar el código.' });
  }
};
