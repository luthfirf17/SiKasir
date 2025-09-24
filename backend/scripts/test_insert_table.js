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
    console.log('Connected, inserting test table...');
    const insert = await client.query(
      `INSERT INTO "tables" (id, "number", capacity, status, location, location_description, notes) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING id, "number", capacity, status, location, location_description, notes`,
      ['TTEST', 4, 'available', 'indoor', 'This is a test description', 'These are test notes']
    );
    console.log('Insert result:', insert.rows[0]);

    const select = await client.query(`SELECT id, "number", capacity, status, location, location_description, notes FROM "tables" WHERE "number" = $1`, ['TTEST']);
    console.log('Select result:', select.rows);

    // cleanup
    await client.query(`DELETE FROM "tables" WHERE "number" = $1`, ['TTEST']);
    console.log('Cleanup done');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await client.end();
  }
})();
