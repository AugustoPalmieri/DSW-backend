
import { Router } from 'express';
import { ReadUser, CreateUser, LoginUser } from './admin.controler.js';

const router = Router();

// Ruta para obtener una respuesta en /api/admin
router.get('/', (req, res) => {
    res.json({ msg: 'Bienvenido a la API de administradores' });
});

router.get('/read', ReadUser); 
router.post('/create', CreateUser);
router.post('/login', LoginUser);

export default router;
