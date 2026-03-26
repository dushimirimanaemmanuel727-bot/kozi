const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://kazi_user:kazi_password@localhost:5433/kazi_home'
});

async function test() {
  try {
    const client = await pool.connect();
    console.log('Connected!');
    const res = await client.query('SELECT 1');
    console.log('Query OK:', res.rows);
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows);
    const userCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User'");
    console.log('User Columns:', userCols.rows);
    const appCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Application'");
    console.log('Application Columns:', appCols.rows);
    const jobCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Job'");
    console.log('Job Columns:', jobCols.rows);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
