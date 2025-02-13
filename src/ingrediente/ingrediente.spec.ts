import request from 'supertest';
import { app } from '../app.js';

describe('GET /api/ingredientes', () => {
  it('debería devolver todos los ingredientes', async () => {
    const response = await request(app).get('/api/ingredientes');
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });
});

describe('GET /api/ingredientes/:codIngrediente', () => {
  it('debería devolver un ingrediente por su código', async () => {
    const codIngrediente = 1; // Usar un código válido para un ingrediente en tu base de datos
    const response = await request(app).get(`/api/ingredientes/${codIngrediente}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('codIngrediente', codIngrediente);
  });

  it('debería devolver error si no se encuentra el ingrediente', async () => {
    const codIngrediente = 9999; // Usar un código que no exista
    const response = await request(app).get(`/api/ingredientes/${codIngrediente}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('ingrediente Not Found'); // Mensaje esperado según el controlador
  });
});

describe('POST /api/ingredientes', () => {
  it('debería crear un nuevo ingrediente', async () => {
    const nuevoIngrediente = {
      descripcion: 'Lechuga',
      stock: 100,
    };
    const response = await request(app).post('/api/ingredientes').send(nuevoIngrediente);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('INGREDIENTE CREADA'); // Mensaje esperado según el controlador
    expect(response.body.data).toHaveProperty('codIngrediente');
  });
});

describe('PUT /api/ingredientes/:codIngrediente', () => {
  it('debería actualizar un ingrediente existente', async () => {
    const codIngrediente = 1;
    const actualizado = {
      descripcion: 'Tomate',
      stock: 120,
    };
    const response = await request(app).put(`/api/ingredientes/${codIngrediente}`).send(actualizado);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('INGREDIENTE MODIFICADO CORRECTAMENTE'); // Mensaje esperado según el controlador
    expect(response.body.data).toHaveProperty('descripcion', 'Tomate');
  });

  it('debería devolver error si no se encuentra el ingrediente', async () => {
    const codIngrediente = 9999; // Usar un código que no exista
    const actualizado = {
      descripcion: 'Tomate',
      stock: 120,
    };
    const response = await request(app).put(`/api/ingredientes/${codIngrediente}`).send(actualizado);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('ingrediente Not Found'); // Mensaje esperado según el controlador
  });
});

describe('DELETE /api/ingredientes/:codIngrediente', () => {
  it('debería eliminar un ingrediente', async () => {
    const codIngrediente = 36;
    const response = await request(app).delete(`/api/ingredientes/${codIngrediente}`);
    expect(response.status).toBe(200); 
    expect(response.body.message).toBe('INGREDIENTE ELIMINADO CORRECTAMENTE');
}, 10000); 


});