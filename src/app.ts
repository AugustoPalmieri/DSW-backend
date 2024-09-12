import express from 'express'
import cors from 'cors';
import { clienteRouter } from './cliente/cliente.routes.js'
import { hamburguesaRouter } from './hamburguesa/hamburguesa.routes.js'
import { ingredienteRouter } from './ingrediente/ingrediente.routes.js'


/*const app = express()

app.use(express.json())

app.use('/api/clientes', clienteRouter)
app.use('/api/hamburguesas', hamburguesaRouter)
app.use('/api/ingredientes', ingredienteRouter)

app.use(cors());


app.use(( _ , res)=>{
    return res.status(404).send({message: 'Resource Not Found'})
})

app.listen(3000,() =>{
    console.log('Server is running on http://localhost:3000/')

}) */

//import express from 'express';
//import cors from 'cors';

const app = express();

app.use(express.json());

// Habilitar CORS para todas las rutas desde http://localhost:4200
app.use(cors({
  origin: 'http://localhost:4200'
}));

// Tus rutas y middlewares
app.use('/api/clientes', clienteRouter);
app.use('/api/hamburguesas', hamburguesaRouter);
app.use('/api/ingredientes', ingredienteRouter);

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource Not Found' });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/');
});
