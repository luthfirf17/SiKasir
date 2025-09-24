const { AppDataSource } = require('../dist/config/database');
const { QrCode } = require('../dist/models/QrCode');
const { Table } = require('../dist/models/Table');

const id = process.argv[2];
if (!id) {
  console.error('Usage: node delete_table_by_id.js <tableId>');
  process.exit(1);
}

async function run() {
  try {
    await AppDataSource.initialize();
    const qrRepo = AppDataSource.getRepository(QrCode);
    const tableRepo = AppDataSource.getRepository(Table);

    console.log('Deleting QR codes for table', id);
    await qrRepo.delete({ table_id: id });
    console.log('Deleted QR codes');

    console.log('Deleting table', id);
    await tableRepo.delete(id);
    console.log('Deleted table');

    process.exit(0);
  } catch (err) {
    console.error('Error in deletion script:', err);
    process.exit(2);
  }
}

run();
