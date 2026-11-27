import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const seedFile = path.join(projectRoot, 'db', 'seeds', 'dev_seed.sql');

async function runSeed() {
  const isTest = process.argv.slice(2).includes('--test');
  const database = isTest
    ? process.env.DB_NAME_TEST || 'hamburgueseria_sql_test'
    : process.env.DB_NAME || 'hamburgueseria_sql';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'dsw',
    password: process.env.DB_PASSWORD || 'dsw',
    database,
    multipleStatements: true,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
  });

  try {
    const sql = (await fs.readFile(seedFile, 'utf8')).replace(/\r\n/g, '\n').trim();
    await connection.query(sql);
    console.log(`Seed aplicado en ${database}.`);
  } finally {
    await connection.end();
  }
}

runSeed().catch((err) => {
  console.error('Error ejecutando seed:', err.message || err);
  process.exit(1);
});
