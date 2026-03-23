import { Router } from 'express';
import { enviarFormulario } from './contacto.controler.js';

const router = Router();

router.post('/', enviarFormulario);                    

export default router;