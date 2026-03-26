const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://kazi_user:kazi_password@localhost:5433/kazi_home'
});

async function main() {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'WorkerProfile'");
  console.log('WorkerProfile Columns:', res.rows);
  process.exit(0);
}

main();
