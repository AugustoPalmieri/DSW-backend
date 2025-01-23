import { Router } from 'express';
import { enviarFormulario } from './contacto.controler.js'

const router = Router();

// Ruta para procesar el formulario y enviar el correo
router.post('/', enviarFormulario);

export default router;
