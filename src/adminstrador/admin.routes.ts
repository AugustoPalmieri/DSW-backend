import { Router } from 'express';
import { enviarCodigo, verificarCodigo } from "./admin.repository.js"

const router = Router();

router.post('/enviar-codigo', enviarCodigo); // Endpoint para enviar el código
router.post('/verificar-codigo', verificarCodigo); // Endpoint para verificar el código

export default router;
