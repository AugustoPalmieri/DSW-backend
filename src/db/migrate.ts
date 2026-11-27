import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql, { RowDataPacket } from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const migrationsDir = path.join(projectRoot, 'db', 'migrations');

const BASELINE_FILE = '20261111000001_baseline_schema.sql';

function normalizeSql(content: string): string {
  return content.replace(/\r\n/g, '\n').trim();
}

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

async function runMigrations() {
  const args = process.argv.slice(2);
  const isBaseline = args.includes('--baseline');
  const isTest = args.includes('--test');

  const database = isTest
    ? process.env.DB_NAME_TEST || 'hamburgueseria_sql_test'
    : process.env.DB_NAME || 'hamburgueseria_sql';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_MIGRATE_USER || process.env.DB_USER || 'dsw',
    password: process.env.DB_MIGRATE_PASSWORD || process.env.DB_PASSWORD || 'dsw',
    database,
    multipleStatements: true,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
  });

  const lockName = `dsw_migrate_${database}`;

  try {
    const [lockRows] = await connection.query<RowDataPacket[]>(
      'SELECT GET_LOCK(?, 10) AS acquired',
      [lockName]
    );
    if (!lockRows[0] || lockRows[0].acquired !== 1) {
      throw new Error(`No se pudo adquirir el lock de migracion para ${database}`);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) NOT NULL PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    const [appliedRows] = await connection.query<RowDataPacket[]>(
      'SELECT filename, checksum FROM schema_migrations'
    );
    const applied = new Map<string, string>(
      appliedRows.map((row) => [row.filename as string, row.checksum as string])
    );

    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (isBaseline) {
      if (!files.includes(BASELINE_FILE)) {
        throw new Error(`No se encontro el archivo baseline ${BASELINE_FILE}`);
      }
      const raw = await fs.readFile(path.join(migrationsDir, BASELINE_FILE), 'utf8');
      const checksum = sha256(normalizeSql(raw));

      if (applied.has(BASELINE_FILE)) {
        console.log(`Baseline ya registrado en ${database}: ${BASELINE_FILE}`);
      } else {
        await connection.query(
          'INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)',
          [BASELINE_FILE, checksum]
        );
        console.log(`Baseline registrado en ${database}: ${BASELINE_FILE}`);
      }
      return;
    }

    let appliedCount = 0;

    for (const file of files) {
      const raw = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      const normalized = normalizeSql(raw);
      const checksum = sha256(normalized);

      const existingChecksum = applied.get(file);
      if (existingChecksum) {
        if (existingChecksum !== checksum) {
          throw new Error(
            `La migracion ya aplicada "${file}" fue modificada (checksum distinto). Crea una migracion nueva.`
          );
        }
        continue;
      }

      await connection.query(normalized);
      await connection.query(
        'INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)',
        [file, checksum]
      );
      appliedCount++;
      console.log(`Migracion aplicada en ${database}: ${file}`);
    }

    if (appliedCount === 0) {
      console.log(`Sin migraciones pendientes en ${database}.`);
    }
  } finally {
    try {
      await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
    } catch {
      // ignorar error al liberar lock si la conexion fallo
    }
    await connection.end();
  }
}

runMigrations().catch((err) => {
  console.error('Error ejecutando migraciones:', err.message || err);
  process.exit(1);
});
