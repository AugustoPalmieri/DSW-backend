import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { clienteRouter } from './cliente/cliente.routes.js';
import { hamburguesaRouter } from './hamburguesa/hamburguesa.routes.js';
import { ingredienteRouter } from './ingrediente/ingrediente.routes.js';
import { pedidoRouter } from './pedido/pedido.routes.js';
import precioRouter from './precio/precio.routes.js';
import contactoRoutes from './contacto/contacto.routes.js'

const app = express();
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Habilita la carga de archivos JSON
app.use(express.json());

// Configura CORS para permitir solicitudes del frontend
app.use(cors({
  origin: 'http://localhost:4200'
}));

// Sirve los archivos estáticos desde la carpeta 'uploads'
// Asegúrate de que 'uploads' está en el directorio correcto, fuera de 'src'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de tu API
app.use('/api/clientes', clienteRouter);
app.use('/api/hamburguesas', hamburguesaRouter);
app.use('/api/ingredientes', ingredienteRouter);
app.use('/api/pedidos', pedidoRouter);
app.use('/api/precios', precioRouter);
app.use('/contacto', contactoRoutes);
// Manejo de errores 404
app.use((_, res) => {
  return res.status(404).send({ message: 'Resource Not Found' });
});

// Inicia el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/');
});
