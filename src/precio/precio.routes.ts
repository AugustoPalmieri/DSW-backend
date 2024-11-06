import { Router } from 'express';
import { getPrecioActual } from './precio.controler.js'
const router = Router();

router.get('/actual/:idHamburguesa', getPrecioActual);

export default router;