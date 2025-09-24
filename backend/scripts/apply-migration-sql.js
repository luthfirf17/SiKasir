// Quick script to apply migration SQL using pg
const { Client } = require('pg');
require('dotenv').config();

(async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'kasir',
  });

  try {
    await client.connect();
    console.log('Connected to DB, applying migration...');
    await client.query(`ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "location_description" text`);
    await client.query(`ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "notes" text`);
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
