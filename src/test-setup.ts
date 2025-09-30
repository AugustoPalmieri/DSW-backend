import dotenv from 'dotenv';

// Establecer entorno de test
process.env.NODE_ENV = 'test';

// Cargar variables de entorno para tests
dotenv.config();

// Configurar timeout global para tests
jest.setTimeout(30000);

// Mock de nodemailer para evitar envío real de emails en tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
  }))
}));

// Configuración global para tests
beforeAll(async () => {
  console.log('🧪 Iniciando suite de tests...');
});

afterAll(async () => {
  console.log('✅ Tests completados');
});