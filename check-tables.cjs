const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://kazi_user:kazi_password@localhost:5433/kazi_home'
});

async function main() {
  const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', res.rows.map(r => r.table_name));
  process.exit(0);
}

main();
