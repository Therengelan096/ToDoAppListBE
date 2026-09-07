import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsDir)) return;

    const files = fs.readdirSync(migrationsDir);

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sqlQuery = fs.readFileSync(filePath, 'utf8').trim();

        if (!sqlQuery) {
          console.log(`Migración omitida (archivo vacío): ${file}`);
          continue;
        }

        await pool.query(sqlQuery);
        console.log(`Migración ejecutada correctamente: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error.message);
    process.exit(1);
  }
};