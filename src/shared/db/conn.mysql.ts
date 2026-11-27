import 'dotenv/config';
import mysql from 'mysql2/promise';

const isTest = process.env.NODE_ENV === 'test';
const database = isTest
  ? process.env.DB_NAME_TEST || 'hamburgueseria_sql_test'
  : process.env.DB_NAME || 'hamburgueseria_sql';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'dsw',
  password: process.env.DB_PASSWORD || 'dsw',
  database,
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
});