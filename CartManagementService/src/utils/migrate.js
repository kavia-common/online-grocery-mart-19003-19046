'use strict';

const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

/**
 * Simple migration runner to apply .sql files in /migrations in filename order.
 * It keeps track of applied files in table _migrations.
 */
async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getApplied() {
  const res = await query('SELECT filename FROM _migrations ORDER BY filename ASC');
  return res.rows.map(r => r.filename);
}

async function applyMigration(filePath, filename) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await query('BEGIN');
  try {
    await query(sql);
    await query('INSERT INTO _migrations (filename) VALUES ($1)', [filename]);
    await query('COMMIT');
    console.log(`Applied migration: ${filename}`);
  } catch (err) {
    await query('ROLLBACK');
    throw err;
  }
}

// PUBLIC_INTERFACE
async function runMigrationsIfEnabled() {
  /** Run migrations if AUTO_MIGRATE is 'true'. */
  if (String(process.env.AUTO_MIGRATE || '').toLowerCase() !== 'true') {
    return;
  }
  await ensureMigrationsTable();
  const applied = new Set(await getApplied());
  const migDir = path.resolve(__dirname, '../../migrations');
  if (!fs.existsSync(migDir)) return;

  const files = fs.readdirSync(migDir)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    if (applied.has(file)) continue;
    await applyMigration(path.join(migDir, file), file);
  }
}

module.exports = { runMigrationsIfEnabled };
