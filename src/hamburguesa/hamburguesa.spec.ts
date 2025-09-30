import request from 'supertest';
import { app } from '../app.js';

describe('Hamburguesa API', () => {
  let hamburguesaId: string;

  describe('GET /api/hamburguesas', () => {
    it('debería devolver todas las hamburguesas', async () => {
      const response = await request(app).get('/api/hamburguesas');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/hamburguesas', () => {
    it('debería crear una nueva hamburguesa', async () => {
      const nuevaHamburguesa = {
        nombre: 'Hamburguesa Test',
        descripcion: 'Una hamburguesa de prueba',
        precio: 15.99
      };

      const response = await request(app)
        .post('/api/hamburguesas')
        .send(nuevaHamburguesa);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('HAMBURGUESA CREADA');
      expect(response.body.data).toHaveProperty('idHamburguesa');
      hamburguesaId = response.body.data.idHamburguesa;
    });
  });

  describe('GET /api/hamburguesas/:id', () => {
    it('debería devolver una hamburguesa por ID', async () => {
      const response = await request(app).get(`/api/hamburguesas/${hamburguesaId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('idHamburguesa');
    });

    it('debería devolver 404 si no encuentra la hamburguesa', async () => {
      const response = await request(app).get('/api/hamburguesas/9999');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hamburguesa Not Found');
    });
  });

  describe('PUT /api/hamburguesas/:id', () => {
    it('debería actualizar una hamburguesa existente', async () => {
      const hamburguesaActualizada = {
        nombre: 'Hamburguesa Test Actualizada',
        descripcion: 'Descripción actualizada',
        precio: 18.99
      };

      const response = await request(app)
        .put(`/api/hamburguesas/${hamburguesaId}`)
        .send(hamburguesaActualizada);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('HAMBURGUESA MODIFICADA CORRECTAMENTE');
    });

    it('debería devolver 404 si no encuentra la hamburguesa', async () => {
      const response = await request(app)
        .put('/api/hamburguesas/9999')
        .send({ nombre: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hamburguesa Not Found');
    });
  });

  describe('DELETE /api/hamburguesas/:id', () => {
    it('debería eliminar una hamburguesa', async () => {
      const response = await request(app).delete(`/api/hamburguesas/${hamburguesaId}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('HAMBURGUESA ELIMINADA CORRECTAMENTE');
    });
  });
});