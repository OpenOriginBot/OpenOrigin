/**
 * Setup script: create memory table in Supabase
 * Run: node setup-memory.js
 */
import pg from 'pg'
const { Client } = pg

// Connection via Supabase pooler
// Password = JWT signature base64 part (last segment of anon key)
const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://postgres.fippycifijhcmsrxoylr:CM2zy328XkxfiMa7rZPZS59XZfX7j_PK2wZiC8f5nAY@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'

async function setup() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to Supabase PostgreSQL')

    // Create memory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS memory (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        agent_name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('技术', '偏好', '项目', '过程')),
        content TEXT NOT NULL,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `)
    console.log('✅ memory table created/verified')

    // Create index for faster approved lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_memory_approved ON memory(approved)
    `)
    console.log('✅ index created/verified')

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

setup()
