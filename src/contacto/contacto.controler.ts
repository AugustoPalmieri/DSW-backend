import { Request, Response } from 'express';
import transporter from '../mailService.js'
// Controlador para manejar el envío del formulario
export const enviarFormulario = async (req: Request, res: Response) => {
  const { firstName, lastName, phone, email, message } = req.body;

  try{
    const mailOptions = {
      from: `"Formulario de Contacto" <hamburgueseriautn@gmail.com>`,
      to: 'hamburgueseriautn@gmail.com',
      subject: 'Nuevo mensaje del formulario de contacto',
      html: `
        <h1>Nuevo mensaje recibido</h1>
        <p><strong>Nombre:</strong> ${firstName} ${lastName}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo', error });
  }
};
