const { AppDataSource } = require('../dist/config/database');

(async () => {
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
    console.log('Public tables:');
    res.forEach(r => console.log('- ' + r.table_name));
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
