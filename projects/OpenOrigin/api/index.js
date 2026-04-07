// OpenOrigin API - Supabase REST API proxy
// ESM format required for Vercel serverless

const SB_URL = 'https://fippycifijhcmsrxoylr.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcHB5Y2lmaWpoY21zcnhveWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTU2NjgsImV4cCI6MjA5MDk3MTY2OH0.CM2zy328XkxfiMa7rZPZS59XZfX7j_PK2wZiC8f5nAY'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function handleCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, apikey')
  res.status(204).end()
}

async function sbGet(table, params = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = `${SB_URL}/rest/v1/${table}${qs ? '?' + qs : ''}`
  const r = await fetch(url, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
  })
  return r.json()
}

async function sbPost(table, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(data)
  })
  return r.json()
}

async function sbPatch(table, id, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return r.json()
}

async function sbDelete(table, id) {
  await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`
    }
  })
}

// ─── Route Tables ─────────────────────────────────────────────────────────────
const routes = {
  agents:    { methods: ['GET', 'POST'] },
  tasks:     { methods: ['GET', 'POST'] },
  logs:      { methods: ['GET', 'POST'] },
  meetings:  { methods: ['GET', 'POST'] },
  parliament:{ methods: ['GET', 'POST'] },
  memory:    { methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const rawUrl = req.url || '/'
  const rawPath = rawUrl.split('?')[0]
  const path = rawPath.replace(/^\//, '')
  const method = req.method || 'GET'

  try {
    // CORS preflight
    if (method === 'OPTIONS') {
      handleCors(res)
      return
    }

    // Parse path
    const segments = path.split('/').filter(Boolean)

    // Skip 'api' prefix if present (vercel rewrite includes /api/ in path)
    const offset = segments[0] === 'api' ? 1 : 0
    const table = segments[offset]
    const id = segments[offset + 1]
    const action = segments[offset + 2]

    // Health check (skip api prefix for health check too)
    const cleanPath = segments.slice(offset).join('/')
    if (cleanPath === 'health' || cleanPath === '') {
      return res.json({ status: 'ok', project: 'OpenOrigin API', version: '1.0.0', rawUrl })
    }

    // Route validation
    if (!table || !routes[table]) {
      return res.status(404).json({ error: 'Unknown table', tables: Object.keys(routes) })
    }

    if (!routes[table].methods.includes(method)) {
      return res.status(405).json({ error: `Method ${method} not allowed` })
    }

    // GET /:table or GET /:table/:id
    if (method === 'GET') {
      const p = id ? `${table}?id=eq.${id}` : table
      const data = await sbGet(p)
      return res.json(data)
    }

    // POST /:table
    if (method === 'POST') {
      let body = {}
      try { body = JSON.parse(req.body || '{}') } catch {}
      const data = await sbPost(table, body)
      return res.status(201).json(data)
    }

    // PATCH /:table/:id or PATCH /:table/:id/:action
    if (method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'ID required' })
      let body = {}
      try { body = JSON.parse(req.body || '{}') } catch {}
      if (action === 'approve') {
        await sbPatch(table, id, { approved: true })
        return res.json({ ok: true })
      }
      const data = await sbPatch(table, id, body)
      return res.json(data)
    }

    // DELETE /:table/:id
    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID required' })
      await sbDelete(table, id)
      return res.json({ ok: true })
    }
  } catch (e) {
    console.error('API Error:', e)
    return res.status(500).json({ error: 'Internal error', message: e.message })
  }
}
