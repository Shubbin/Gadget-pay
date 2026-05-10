const { Pool } = require('pg');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const updateSchema = async () => {
  try {
    console.log('Adding card_design column to users...');
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS card_design VARCHAR(50) DEFAULT 'default'");
    console.log('Database updated successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
};

updateSchema();
