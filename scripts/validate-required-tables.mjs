#!/usr/bin/env node
/**
 * CI guard: verifies the deployed database has all required tables.
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from env.
 * Exits non-zero (and prints which tables are missing) when any are absent.
 */
import process from 'node:process';

const REQUIRED_TABLES = [
  'projects',
  'support_tickets',
  'notifications',
  'profiles',
  'user_roles',
  'lead_submissions',
  'services',
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('[validate-required-tables] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(2);
}

async function main() {
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/db_required_tables_check`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ _tables: REQUIRED_TABLES }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[validate-required-tables] RPC failed ${res.status}: ${text}`);
    process.exit(3);
  }

  const rows = await res.json();
  const missing = rows.filter((r) => !r.present).map((r) => r.tbl);

  if (missing.length) {
    console.error(`[validate-required-tables] MISSING tables: ${missing.join(', ')}`);
    console.error('Run pending migrations before deploying.');
    process.exit(1);
  }

  console.log(`[validate-required-tables] OK — all ${REQUIRED_TABLES.length} tables present.`);
}

main().catch((err) => {
  console.error('[validate-required-tables] Unexpected error:', err);
  process.exit(4);
});
