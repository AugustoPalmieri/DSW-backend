import request from 'supertest';
import { app } from '../app.js';
import { getAdminToken, getClientToken, cleanupPedido, cleanupHamburguesa, cleanupCliente } from '../test-helpers.js';

describe('Pedido API', () => {
  let pedidoId: string;
  let clienteId: string;
  let hamburguesaId: string;
  const adminToken = getAdminToken();
  let clientToken: string;

  beforeAll(async () => {
    const testEmail = `testpedido${Date.now()}@test.com`;
    // Crear cliente de prueba
    const cliente = await request(app)
      .post('/api/clientes')
      .send({
        nombre: 'Test',
        apellido: 'Cliente',
        telefono: '123456789',
        email: testEmail,
        direccion: 'Test 123',
        password: 'password123'
      });
    clienteId = cliente.body.data.idCliente;
    clientToken = getClientToken(Number(clienteId), testEmail);

    // Crear hamburguesa de prueba con token admin
    const hamburguesa = await request(app)
      .post('/api/hamburguesas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Hamburguesa Test Pedido',
        descripcion: 'Para test de pedidos',
        precio: 12.99
      });
    hamburguesaId = hamburguesa.body.data.idHamburguesa;
  });

  afterAll(async () => {
    // Rollback / Limpieza en cascada respetando Foreign Keys
    await cleanupPedido(pedidoId);
    await cleanupHamburguesa(hamburguesaId);
    await cleanupCliente(clienteId);
  });

  describe('GET /api/pedidos', () => {
    it('debería devolver todos los pedidos', async () => {
      const response = await request(app)
        .get('/api/pedidos')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/pedidos', () => {
    it('debería crear un nuevo pedido', async () => {
      const nuevoPedido = {
        modalidad: 'TAKEAWAY',
        estado: 'EN PROCESO',
        idCliente: clienteId,
        hamburguesas: [
          {
            idHamburguesa: hamburguesaId,
            cantidad: 2,
            nombre: 'Hamburguesa Test Pedido'
          }
        ]
      };

      const response = await request(app)
        .post('/api/pedidos')
        .send(nuevoPedido);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('PEDIDO CREADO');
      expect(response.body.data).toHaveProperty('idPedido');
      pedidoId = response.body.data.idPedido;
    });

    it('debería fallar si no incluye hamburguesas', async () => {
      const pedidoSinHamburguesas = {
        modalidad: 'TAKEAWAY',
        estado: 'EN PROCESO',
        idCliente: clienteId,
        hamburguesas: []
      };

      const response = await request(app)
        .post('/api/pedidos')
        .send(pedidoSinHamburguesas);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Debe incluir al menos una hamburguesa en el pedido');
    });
  });

  describe('GET /api/pedidos/:id', () => {
    it('debería devolver un pedido por ID', async () => {
      const response = await request(app)
        .get(`/api/pedidos/${pedidoId}`)
        .set('Authorization', `Bearer ${clientToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('idPedido');
    });

    it('debería devolver 404 si no encuentra el pedido', async () => {
      const response = await request(app)
        .get('/api/pedidos/9999')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Pedido No Encontrado');
    });
  });

  describe('PUT /api/pedidos/:id/estado', () => {
    it('debería actualizar el estado del pedido', async () => {
      const nuevoEstado = { estado: 'LISTO' };

      const response = await request(app)
        .put(`/api/pedidos/${pedidoId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nuevoEstado);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Estado del pedido actualizado correctamente');
    });

    it('debería fallar si no se proporciona estado', async () => {
      const response = await request(app)
        .put(`/api/pedidos/${pedidoId}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('El estado es obligatorio');
    });
  });
});