import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { clienteRouter } from './cliente/cliente.routes.js';
import { hamburguesaRouter } from './hamburguesa/hamburguesa.routes.js';
import { ingredienteRouter } from './ingrediente/ingrediente.routes.js';
import { pedidoRouter } from './pedido/pedido.routes.js';
import precioRouter from './precio/precio.routes.js';
import contactoRoutes from './contacto/contacto.routes.js';
import adminRoutes from './adminstrador/admin.routes.js';
import { deliveryRouter } from './delivery/delivery.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());

app.use(cors({
  origin: allowedOrigins
}));

app.use('/uploads', express.static(path.resolve('./uploads')));
app.use('/api/clientes', clienteRouter);
app.use('/api/hamburguesas', hamburguesaRouter);
app.use('/api/ingredientes', ingredienteRouter);
app.use('/api/pedidos', pedidoRouter);
app.use('/api/precios', precioRouter);
app.use('/contacto', contactoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRouter);

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource Not Found' });
});

app.use(errorHandler);
