import request from 'supertest';
import { app } from './app.js';

describe('App', () => {
  it('debería responder en la ruta raíz', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(404); // Asumiendo que no hay ruta raíz definida
  });

  it('debería tener las rutas de API configuradas', async () => {
    // Test básico para verificar que las rutas están configuradas
    const routes = [
      '/api/clientes',
      '/api/hamburguesas', 
      '/api/ingredientes',
      '/api/pedidos'
    ];

    for (const route of routes) {
      const response = await request(app).get(route);
      // Verificar que la ruta existe (no 404)
      expect(response.status).not.toBe(404);
    }
  });
});