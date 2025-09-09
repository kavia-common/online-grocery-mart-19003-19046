'use strict';

const { Pool } = require('pg');

/**
 * Database configuration and connection pool for PostgreSQL.
 * Reads configuration from environment variables.
 * IMPORTANT: Do not hardcode secrets; configure via .env.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
  max: process.env.PGPOOL_MAX ? parseInt(process.env.PGPOOL_MAX, 10) : 10,
  idleTimeoutMillis: process.env.PGPOOL_IDLE ? parseInt(process.env.PGPOOL_IDLE, 10) : 30000
});

// PUBLIC_INTERFACE
async function query(text, params) {
  /** Execute a parameterized query using the pool. */
  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};
