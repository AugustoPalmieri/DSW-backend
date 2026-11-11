import jwt from 'jsonwebtoken';
import { pool } from './shared/db/conn.mysql.js';

/**
 * Genera un token JWT con rol admin para pruebas en endpoints protegidos con adminMiddleware
 */
export function getAdminToken(email: string = 'admin.test@test.com'): string {
  const secret = process.env.JWT_SECRET || 'supersecretacontraseña';
  return jwt.sign({ email, rol: 'admin' }, secret, { expiresIn: '1h' });
}

/**
 * Genera un token JWT de cliente para pruebas en endpoints protegidos con authMiddleware
 */
export function getClientToken(idCliente: number = 1, email: string = 'cliente.test@test.com'): string {
  const secret = process.env.JWT_SECRET || 'supersecretacontraseña';
  return jwt.sign({ idCliente, email }, secret, { expiresIn: '1h' });
}

/**
 * Limpieza de datos creados en tests (Rollback físico)
 */
export async function cleanupCliente(idCliente?: string | number, email?: string): Promise<void> {
  try {
    if (idCliente) {
      await pool.query('DELETE FROM clientes WHERE idCliente = ?', [idCliente]);
    }
    if (email) {
      await pool.query('DELETE FROM clientes WHERE email = ?', [email]);
    }
  } catch (error) {
    console.error('Error limpiando cliente:', error);
  }
}

export async function cleanupHamburguesa(idHamburguesa?: string | number): Promise<void> {
  if (!idHamburguesa) return;
  try {
    await pool.query('DELETE FROM precios WHERE idHamburguesa = ?', [idHamburguesa]);
    await pool.query('DELETE FROM ingredientes_hamburguesa WHERE idHamburguesa = ?', [idHamburguesa]);
    await pool.query('DELETE FROM hamburguesas WHERE idHamburguesa = ?', [idHamburguesa]);
  } catch (error) {
    console.error('Error limpiando hamburguesa:', error);
  }
}

export async function cleanupIngredientes(codigos: number[]): Promise<void> {
  if (!codigos || codigos.length === 0) return;
  try {
    await pool.query('DELETE FROM ingredientes WHERE codIngrediente IN (?)', [codigos]);
  } catch (error) {
    console.error('Error limpiando ingredientes:', error);
  }
}

export async function cleanupPedido(idPedido?: string | number): Promise<void> {
  if (!idPedido) return;
  try {
    await pool.query('DELETE FROM hamburguesas_pedidos WHERE idPedido = ?', [idPedido]);
    await pool.query('DELETE FROM pedidos WHERE idPedido = ?', [idPedido]);
  } catch (error) {
    console.error('Error limpiando pedido:', error);
  }
}
