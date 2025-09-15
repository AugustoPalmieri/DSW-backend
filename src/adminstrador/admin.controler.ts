import { Request, Response } from 'express';
import transporter from '../mailService.js';// Función para enviar un código al correo electrónico
export const enviarCodigo = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  // Genera un código aleatorio de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000);


  // Configuración del correo
  const mailOptions = {
    from: process.env.EMAIL_USER, // Correo desde el que enviarás
    to: process.env.EMAIL_USER, // Correo destino
    subject: 'Código de acceso',
    text: `Tu código de acceso es: ${codigo}`,
  };

  // Enviar el correo
  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado a:', email);
    return res.status(200).send({ message: 'Correo enviado con el código de acceso' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return res.status(500).send({ message: 'Error al enviar el correo' });
  }
};
