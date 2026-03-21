const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

async function migrate() {
  const schemaPath = path.join(__dirname, '../supabase_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('Starting migration to Aiven PostgreSQL...');

  try {
    // Enable UUID extension first
    console.log('Enabling uuid-ossp extension...');
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Split by semicolon, but filter out empty lines or comments
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await query(statement);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed during statement execution:');
    console.error(err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
    process.exit(1);
  }
}

migrate();

// Simon says: this is a simple script to push the existing schema to the new DB.
