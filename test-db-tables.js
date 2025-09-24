const { Client } = require('pg');

// Database configuration - sesuaikan dengan setup PostgreSQL Desktop Anda
const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres', // default user untuk PostgreSQL Desktop
  password: '', // biasanya kosong untuk PostgreSQL Desktop
  database: 'postgres' // default database
};

async function checkDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔍 Mencoba koneksi ke database...');
    await client.connect();
    console.log('✅ Koneksi database berhasil!');
    
    // Check if kasirku_db exists
    console.log('\n📋 Mengecek database yang tersedia:');
    const dbResult = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log('Database yang tersedia:');
    dbResult.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });
    
    // Check if kasirku_db exists
    const kasirkuDbExists = dbResult.rows.some(row => row.datname === 'kasirku_db');
    
    if (kasirkuDbExists) {
      console.log('\n🎯 Database kasirku_db ditemukan! Mengecek tabel...');
      
      // Connect to kasirku_db
      await client.end();
      const kasirkuClient = new Client({
        ...dbConfig,
        database: 'kasirku_db'
      });
      
      await kasirkuClient.connect();
      
      // Get all tables
      const tableResult = await kasirkuClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      
      if (tableResult.rows.length > 0) {
        console.log('\n📊 Tabel yang tersedia di kasirku_db:');
        tableResult.rows.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
        
        // Check specific important tables
        console.log('\n🔍 Detail tabel penting:');
        const importantTables = ['users', 'tables', 'customers', 'menus', 'orders'];
        
        for (const tableName of importantTables) {
          const tableExists = tableResult.rows.some(row => row.table_name === tableName);
          if (tableExists) {
            // Get table structure
            const structureResult = await kasirkuClient.query(`
              SELECT column_name, data_type, is_nullable, column_default
              FROM information_schema.columns 
              WHERE table_name = $1 AND table_schema = 'public'
              ORDER BY ordinal_position;
            `, [tableName]);
            
            console.log(`\n  📋 Tabel: ${tableName}`);
            structureResult.rows.forEach(col => {
              console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
            });
            
            // Get record count
            const countResult = await kasirkuClient.query(`SELECT COUNT(*) as count FROM ${tableName};`);
            console.log(`    📊 Jumlah record: ${countResult.rows[0].count}`);
          } else {
            console.log(`  ❌ Tabel ${tableName} tidak ditemukan`);
          }
        }
      } else {
        console.log('\n⚠️  Tidak ada tabel yang ditemukan di kasirku_db');
      }
      
      await kasirkuClient.end();
    } else {
      console.log('\n❌ Database kasirku_db tidak ditemukan');
      console.log('💡 Mungkin perlu dibuat terlebih dahulu');
    }
    
  } catch (error) {
    console.error('❌ Error saat mengecek database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solusi yang mungkin:');
      console.log('1. Pastikan PostgreSQL Desktop sudah berjalan');
      console.log('2. Cek apakah port 5432 sudah benar');
      console.log('3. Cek username dan password');
    } else if (error.code === '28P01') {
      console.log('\n💡 Error autentikasi:');
      console.log('1. Cek username dan password PostgreSQL');
      console.log('2. Mungkin perlu setting password untuk user postgres');
    }
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Client already closed
    }
  }
}

checkDatabase();
