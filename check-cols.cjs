const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Jesuslove@12@localhost:5432/kazi_home'
});

async function checkCols() {
  try {
    const res = await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name = 'WorkerProfile' AND column_name = 'reviewCount'");
    const res2 = await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name = 'WorkerProfile' AND column_name = 'reviewcount'");
    console.log(`Casing: camelCase=${res.rowCount > 0}, lowercase=${res2.rowCount > 0}`);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkCols();
