const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://kazi_user:kazi_password@localhost:5433/kazi_home'
});

async function main() {
  const res = await pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position");
  const tables = {};
  res.rows.forEach(r => {
    if (!tables[r.table_name]) tables[r.table_name] = [];
    tables[r.table_name].push(r.column_name);
  });
  console.log(JSON.stringify(tables, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
