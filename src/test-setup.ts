import { pool } from './shared/db/conn.mysql.js';

jest.setTimeout(30000);

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
  }))
}));

afterAll(async () => {
  try {
    await pool.end();
  } catch (e) {
    // ignorar si no estaba abierto o ya se cerró
  }
});