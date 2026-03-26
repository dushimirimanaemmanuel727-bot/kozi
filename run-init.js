import { initializeDatabase } from './src/lib/db.ts';

async function main() {
  try {
    const success = await initializeDatabase();
    console.log('Result:', success ? 'DB READY' : 'DB ERROR');
  } catch (err) {
    console.error(err);
  }
}

main();
