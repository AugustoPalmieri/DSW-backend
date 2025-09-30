import request from 'supertest';
import { app } from '../app.js';

describe('Cliente API', () => {
  let clienteId: string;
  const testEmail = `test${Date.now()}@test.com`;

  describe('POST /api/clientes', () => {
    it('Cliente nuevo Juan Perez creado', async () => {
      const nuevoCliente = {
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '123456789',
        email: testEmail,
        direccion: 'Calle Test 123',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/clientes')
        .send(nuevoCliente);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Usuario registrado exitosamente');
      expect(response.body.data).toHaveProperty('idCliente');
      clienteId = response.body.data.idCliente;
    });

    it('debería fallar si faltan campos obligatorios', async () => {
      const clienteIncompleto = {
        nombre: 'Juan'
      };

      const response = await request(app)
        .post('/api/clientes')
        .send(clienteIncompleto);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Todos los campos son obligatorios');
    });
  });

  describe('POST /api/clientes/login', () => {
    it('debería hacer login correctamente', async () => {
      const loginData = {
        email: testEmail,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/clientes/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Inicio de sesión exitoso');
    });

    it('debería fallar con credenciales incorrectas', async () => {
      const loginData = {
        email: testEmail,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/clientes/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('GET /api/clientes', () => {
    it('debería devolver todos los clientes', async () => {
      const response = await request(app).get('/api/clientes');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('debería devolver un cliente por ID', async () => {
      const response = await request(app).get(`/api/clientes/${clienteId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('idCliente');
    });

    it('debería devolver 404 si no encuentra el cliente', async () => {
      const response = await request(app).get('/api/clientes/9999');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Cliente Not Found');
    });
  });
});