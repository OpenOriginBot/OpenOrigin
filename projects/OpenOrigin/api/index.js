/**
 * OpenOrigin API - Supabase REST version
 * Uses PostgREST (Supabase's built-in REST API) instead of direct PostgreSQL
 */
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.fippycifijhcmsrxoylr:gG84PMxGOKFrT40a@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  max: 1,
})

function jsonResponse(data, status = 200) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data),
  }
}

function errorResponse(message, status = 400) {
  return jsonResponse({ detail: message }, status)
}

async function query(text, params) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// ─── Init DB ───────────────────────────────────────────────────────────────────
const INIT_SQL = `
CREATE TABLE IF NOT EXISTS agents (id VARCHAR PRIMARY KEY, emoji VARCHAR DEFAULT '🤖', name VARCHAR NOT NULL, subtitle VARCHAR, type VARCHAR, role VARCHAR, color VARCHAR DEFAULT '#10b981', status VARCHAR DEFAULT 'offline', current_activity VARCHAR, last_seen TIMESTAMP DEFAULT NOW(), completed_tasks INTEGER DEFAULT 0, accuracy FLOAT DEFAULT 0, skills JSONB DEFAULT '[]'::jsonb);
CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title VARCHAR NOT NULL, agent_id VARCHAR REFERENCES agents(id), priority VARCHAR DEFAULT 'medium', col VARCHAR DEFAULT 'todo', progress INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS log_entries (id SERIAL PRIMARY KEY, agent_id VARCHAR, agent VARCHAR, category VARCHAR DEFAULT 'general', message TEXT NOT NULL, time TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS parliament_sessions (id SERIAL PRIMARY KEY, question TEXT NOT NULL, status VARCHAR DEFAULT 'deliberating');
CREATE TABLE IF NOT EXISTS participants (id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES parliament_sessions(id) ON DELETE CASCADE, agent VARCHAR, name VARCHAR NOT NULL, stance VARCHAR DEFAULT 'conditional', status VARCHAR DEFAULT 'active');
CREATE TABLE IF NOT EXISTS parliament_messages (id SERIAL PRIMARY KEY, session_id INTEGER REFERENCES parliament_sessions(id) ON DELETE CASCADE, agent VARCHAR, name VARCHAR NOT NULL, text TEXT NOT NULL, time TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS meetings (id SERIAL PRIMARY KEY, title VARCHAR NOT NULL, date TIMESTAMP, duration_minutes INTEGER DEFAULT 0, meeting_type VARCHAR, participants JSONB DEFAULT '[]'::jsonb, summary TEXT, ai_insights TEXT, has_external_participants BOOLEAN DEFAULT FALSE, external_domains JSONB DEFAULT '[]'::jsonb, sentiment VARCHAR DEFAULT 'neutral');
CREATE TABLE IF NOT EXISTS action_items (id SERIAL PRIMARY KEY, meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE, task VARCHAR NOT NULL, assignee VARCHAR, done BOOLEAN DEFAULT FALSE);
`.split(';').filter(s => s.trim())

let dbInitialized = false
async function ensureInit() {
  if (dbInitialized) return
  try {
    for (const sql of INIT_SQL) {
      if (sql.trim()) await pool.query(sql)
    }
  } catch (e) {
    // Tables may already exist
  }
  dbInitialized = true
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function parseBody(body) {
  if (!body) return {}
  if (typeof body === 'string') {
    try { return JSON.parse(body) } catch { return {} }
  }
  return body
}

// ─── Agents ────────────────────────────────────────────────────────────────────
async function handleAgents(method, queryParams, body) {
  if (method === 'GET') {
    const result = await query('SELECT * FROM agents ORDER BY name')
    return jsonResponse(result.rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { id, emoji = '🤖', name, subtitle, type, role, color = '#10b981', status = 'offline', current_activity, last_seen, completed_tasks = 0, accuracy = 0, skills = [] } = d
    const result = await query(
      `INSERT INTO agents (id, emoji, name, subtitle, type, role, color, status, current_activity, last_seen, completed_tasks, accuracy, skills)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [id, emoji, name, subtitle, type, role, color, status, current_activity, last_seen || new Date(), completed_tasks, accuracy, JSON.stringify(skills)]
    )
    return jsonResponse(result.rows[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleAgentById(method, agentId, body) {
  if (method === 'GET') {
    const result = await query('SELECT * FROM agents WHERE id = $1', [agentId])
    if (!result.rows.length) return errorResponse('Agent not found', 404)
    return jsonResponse(result.rows[0])
  }
  if (method === 'PUT') {
    const d = parseBody(body)
    const keys = ['emoji','name','subtitle','type','role','color','status','current_activity','last_seen','completed_tasks','accuracy','skills']
    const updates = keys.filter(k => d[k] !== undefined)
    if (!updates.length) {
      const r = await query('SELECT * FROM agents WHERE id = $1', [agentId])
      return jsonResponse(r.rows[0])
    }
    const set = updates.map((k, i) => `${k} = $${i+2}`).join(', ')
    const vals = updates.map(k => k === 'skills' ? JSON.stringify(d[k]) : d[k])
    const result = await query(`UPDATE agents SET ${set} WHERE id = $1 RETURNING *`, [agentId, ...vals])
    if (!result.rows.length) return errorResponse('Agent not found', 404)
    return jsonResponse(result.rows[0])
  }
  if (method === 'DELETE') {
    const r = await query('SELECT * FROM agents WHERE id = $1', [agentId])
    if (!r.rows.length) return errorResponse('Agent not found', 404)
    await query('DELETE FROM agents WHERE id = $1', [agentId])
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Tasks ─────────────────────────────────────────────────────────────────────
async function handleTasks(method, queryParams, body) {
  const { col } = queryParams
  if (method === 'GET') {
    const sql = col
      ? `SELECT t.*, json_build_object('id', a.id, 'name', a.name, 'emoji', a.emoji, 'color', a.color) as agent FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id WHERE t.col = $1 ORDER BY t.id`
      : `SELECT t.*, json_build_object('id', a.id, 'name', a.name, 'emoji', a.emoji, 'color', a.color) as agent FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id ORDER BY t.id`
    const result = await query(sql, col ? [col] : [])
    return jsonResponse(result.rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { title, agent_id, priority = 'medium', col: taskCol = 'todo', progress = 0 } = d
    const result = await query(
      'INSERT INTO tasks (title, agent_id, priority, col, progress) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, agent_id, priority, taskCol, progress]
    )
    return jsonResponse(result.rows[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleTaskById(method, taskId, body) {
  if (method === 'GET') {
    const result = await query(
      `SELECT t.*, json_build_object('id', a.id, 'name', a.name, 'emoji', a.emoji, 'color', a.color) as agent FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id WHERE t.id = $1`,
      [taskId]
    )
    if (!result.rows.length) return errorResponse('Task not found', 404)
    return jsonResponse(result.rows[0])
  }
  if (method === 'PUT') {
    const d = parseBody(body)
    const keys = ['title','agent_id','priority','col','progress']
    const updates = keys.filter(k => d[k] !== undefined)
    if (!updates.length) {
      const r = await query('SELECT * FROM tasks WHERE id = $1', [taskId])
      return jsonResponse(r.rows[0])
    }
    const set = updates.map((k, i) => `${k} = $${i+2}`).join(', ')
    const vals = updates.map(k => d[k])
    const result = await query(`UPDATE tasks SET ${set} WHERE id = $1 RETURNING *`, [taskId, ...vals])
    if (!result.rows.length) return errorResponse('Task not found', 404)
    return jsonResponse(result.rows[0])
  }
  if (method === 'DELETE') {
    const r = await query('SELECT * FROM tasks WHERE id = $1', [taskId])
    if (!r.rows.length) return errorResponse('Task not found', 404)
    await query('DELETE FROM tasks WHERE id = $1', [taskId])
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Logs ──────────────────────────────────────────────────────────────────────
async function handleLogs(method, queryParams, body) {
  if (method === 'GET') {
    const { category, limit = 50 } = queryParams
    const sql = category
      ? 'SELECT * FROM log_entries WHERE category = $1 ORDER BY time DESC LIMIT $2'
      : 'SELECT * FROM log_entries ORDER BY time DESC LIMIT $1'
    const result = await query(sql, category ? [category, limit] : [limit])
    return jsonResponse(result.rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { agent_id, agent, category = 'general', message } = d
    const result = await query(
      'INSERT INTO log_entries (agent_id, agent, category, message) VALUES ($1,$2,$3,$4) RETURNING *',
      [agent_id, agent, category, message]
    )
    return jsonResponse(result.rows[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Parliament ─────────────────────────────────────────────────────────────────
async function handleParliament(method, body) {
  if (method === 'GET') {
    const result = await query(`
      SELECT ps.*, 
        COALESCE(json_agg(json_build_object('id', p.id, 'agent', p.agent, 'name', p.name, 'stance', p.stance, 'status', p.status)) FILTER (WHERE p.id IS NOT NULL), '[]') as participants,
        COALESCE(json_agg(json_build_object('id', m.id, 'agent', m.agent, 'name', m.name, 'text', m.text, 'time', m.time)) FILTER (WHERE m.id IS NOT NULL), '[]') as messages
      FROM parliament_sessions ps
      LEFT JOIN participants p ON p.session_id = ps.id
      LEFT JOIN parliament_messages m ON m.session_id = ps.id
      GROUP BY ps.id ORDER BY ps.id DESC
    `)
    return jsonResponse(result.rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { question, status = 'deliberating', participants = [], messages = [] } = d
    const result = await query(
      'INSERT INTO parliament_sessions (question, status) VALUES ($1,$2) RETURNING *',
      [question, status]
    )
    const session = result.rows[0]
    for (const p of participants) {
      await query(
        'INSERT INTO participants (session_id, agent, name, stance, status) VALUES ($1,$2,$3,$4,$5)',
        [session.id, p.agent, p.name, p.stance || 'conditional', p.status || 'active']
      )
    }
    for (const m of messages) {
      await query(
        'INSERT INTO parliament_messages (session_id, agent, name, text) VALUES ($1,$2,$3,$4)',
        [session.id, m.agent, m.name, m.text]
      )
    }
    const r = await query(`
      SELECT ps.*, 
        COALESCE(json_agg(json_build_object('id', p.id, 'agent', p.agent, 'name', p.name, 'stance', p.stance, 'status', p.status)) FILTER (WHERE p.id IS NOT NULL), '[]') as participants,
        COALESCE(json_agg(json_build_object('id', m.id, 'agent', m.agent, 'name', m.name, 'text', m.text, 'time', m.time)) FILTER (WHERE m.id IS NOT NULL), '[]') as messages
      FROM parliament_sessions ps LEFT JOIN participants p ON p.session_id = ps.id LEFT JOIN parliament_messages m ON m.session_id = ps.id
      WHERE ps.id = $1 GROUP BY ps.id`, [session.id]
    )
    return jsonResponse(r.rows[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleParliamentSession(method, sessionId) {
  if (method === 'GET') {
    const result = await query(`
      SELECT ps.*, 
        COALESCE(json_agg(json_build_object('id', p.id, 'agent', p.agent, 'name', p.name, 'stance', p.stance, 'status', p.status)) FILTER (WHERE p.id IS NOT NULL), '[]') as participants,
        COALESCE(json_agg(json_build_object('id', m.id, 'agent', m.agent, 'name', m.name, 'text', m.text, 'time', m.time)) FILTER (WHERE m.id IS NOT NULL), '[]') as messages
      FROM parliament_sessions ps LEFT JOIN participants p ON p.session_id = ps.id LEFT JOIN parliament_messages m ON m.session_id = ps.id
      WHERE ps.id = $1 GROUP BY ps.id`, [sessionId]
    )
    if (!result.rows.length) return errorResponse('Session not found', 404)
    return jsonResponse(result.rows[0])
  }
  return errorResponse('Method not allowed', 405)
}

async function handleParliamentMessages(method, sessionId, body) {
  if (method === 'POST') {
    const d = parseBody(body)
    const { agent, name, text } = d
    const r = await query('SELECT id FROM parliament_sessions WHERE id = $1', [sessionId])
    if (!r.rows.length) return errorResponse('Session not found', 404)
    const result = await query(
      'INSERT INTO parliament_messages (session_id, agent, name, text) VALUES ($1,$2,$3,$4) RETURNING *',
      [sessionId, agent, name, text]
    )
    return jsonResponse(result.rows[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Meetings ───────────────────────────────────────────────────────────────────
async function handleMeetings(method, queryParams, body) {
  const { meeting_type } = queryParams
  if (method === 'GET') {
    const sql = meeting_type
      ? `SELECT m.*, COALESCE(json_agg(json_build_object('id', ai.id, 'task', ai.task, 'assignee', ai.assignee, 'done', ai.done)) FILTER (WHERE ai.id IS NOT NULL), '[]') as action_items
         FROM meetings m LEFT JOIN action_items ai ON ai.meeting_id = m.id WHERE m.meeting_type = $1 GROUP BY m.id ORDER BY m.date DESC`
      : `SELECT m.*, COALESCE(json_agg(json_build_object('id', ai.id, 'task', ai.task, 'assignee', ai.assignee, 'done', ai.done)) FILTER (WHERE ai.id IS NOT NULL), '[]') as action_items
         FROM meetings m LEFT JOIN action_items ai ON ai.meeting_id = m.id GROUP BY m.id ORDER BY m.date DESC`
    const result = await query(sql, meeting_type ? [meeting_type] : [])
    return jsonResponse(result.rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { title, date, duration_minutes = 0, meeting_type: mt, participants = [], summary, ai_insights, has_external_participants = false, external_domains = [], sentiment = 'neutral', action_items = [] } = d
    const result = await query(
      `INSERT INTO meetings (title, date, duration_minutes, meeting_type, participants, summary, ai_insights, has_external_participants, external_domains, sentiment)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, date, duration_minutes, mt, JSON.stringify(participants), summary, ai_insights, has_external_participants, JSON.stringify(external_domains), sentiment]
    )
    const meeting = result.rows[0]
    for (const item of action_items) {
      await query('INSERT INTO action_items (meeting_id, task, assignee, done) VALUES ($1,$2,$3,$4)',
        [meeting.id, item.task, item.assignee, item.done || false])
    }
    const r = await query(`
      SELECT m.*, COALESCE(json_agg(json_build_object('id', ai.id, 'task', ai.task, 'assignee', ai.assignee, 'done', ai.done)) FILTER (WHERE ai.id IS NOT NULL), '[]') as action_items
      FROM meetings m LEFT JOIN action_items ai ON ai.meeting_id = m.id WHERE m.id = $1 GROUP BY m.id`, [meeting.id]
    )
    return jsonResponse(r.rows[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleMeetingStats(method) {
  if (method !== 'GET') return errorResponse('Method not allowed', 405)
  const total = await query('SELECT COUNT(*) as c FROM meetings')
  const open = await query('SELECT COUNT(*) as c FROM action_items WHERE done = FALSE')
  const avg = await query('SELECT COALESCE(AVG(duration_minutes), 0) as a FROM meetings')
  return jsonResponse({
    total: parseInt(total.rows[0].c),
    this_week: 0,
    open_actions: parseInt(open.rows[0].c),
    avg_duration: parseFloat(avg.rows[0].a) || 0,
  })
}

async function handleMeetingById(method, meetingId, body) {
  if (method === 'GET') {
    const result = await query(`
      SELECT m.*, COALESCE(json_agg(json_build_object('id', ai.id, 'task', ai.task, 'assignee', ai.assignee, 'done', ai.done)) FILTER (WHERE ai.id IS NOT NULL), '[]') as action_items
      FROM meetings m LEFT JOIN action_items ai ON ai.meeting_id = m.id WHERE m.id = $1 GROUP BY m.id`, [meetingId]
    )
    if (!result.rows.length) return errorResponse('Meeting not found', 404)
    return jsonResponse(result.rows[0])
  }
  if (method === 'PUT') {
    const d = parseBody(body)
    const keys = ['title','date','duration_minutes','meeting_type','participants','summary','ai_insights','has_external_participants','external_domains','sentiment']
    const updates = keys.filter(k => d[k] !== undefined)
    if (!updates.length) {
      const r = await query('SELECT * FROM meetings WHERE id = $1', [meetingId])
      return jsonResponse(r.rows[0])
    }
    const set = updates.map((k, i) => `${k} = $${i+2}`).join(', ')
    const vals = updates.map(k => ['participants','external_domains'].includes(k) ? JSON.stringify(d[k]) : d[k])
    const result = await query(`UPDATE meetings SET ${set} WHERE id = $1 RETURNING *`, [meetingId, ...vals])
    if (!result.rows.length) return errorResponse('Meeting not found', 404)
    return jsonResponse(result.rows[0])
  }
  if (method === 'DELETE') {
    const r = await query('SELECT * FROM meetings WHERE id = $1', [meetingId])
    if (!r.rows.length) return errorResponse('Meeting not found', 404)
    await query('DELETE FROM meetings WHERE id = $1', [meetingId])
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }
  }
  return errorResponse('Method not allowed', 405)
}

async function handleMeetingActionItems(method, meetingId, body) {
  if (method === 'POST') {
    const d = parseBody(body)
    const r = await query('SELECT id FROM meetings WHERE id = $1', [meetingId])
    if (!r.rows.length) return errorResponse('Meeting not found', 404)
    const result = await query(
      'INSERT INTO action_items (meeting_id, task, assignee, done) VALUES ($1,$2,$3,$4) RETURNING *',
      [meetingId, d.task, d.assignee, d.done || false]
    )
    return jsonResponse(result.rows[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleToggleActionItem(method, itemId) {
  if (method !== 'PATCH') return errorResponse('Method not allowed', 405)
  const r = await query('SELECT * FROM action_items WHERE id = $1', [itemId])
  if (!r.rows.length) return errorResponse('Action item not found', 404)
  const result = await query('UPDATE action_items SET done = NOT done WHERE id = $1 RETURNING *', [itemId])
  return jsonResponse(result.rows[0])
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req) {
  await ensureInit()

  const path = (req.path || '/').replace(/^\//, '')
  const method = (req.method || 'GET').toUpperCase()
  const queryParams = {}
  if (req.query) {
    for (const [k, v] of Object.entries(req.query)) {
      queryParams[k] = Array.isArray(v) ? v[0] : v
    }
  }
  const body = req.body || ''

  let p = path
  if (p.startsWith('api/v1/')) p = p.slice(7)
  else if (p.startsWith('api/')) p = p.slice(4)

  if (p === 'health' || p === '') {
    return jsonResponse({ status: 'ok', project: 'OpenOrigin API', version: '1.0.0' })
  }

  if (p === 'agents') return handleAgents(method, queryParams, body)
  const agentMatch = p.match(/^agents\/(.+)/)
  if (agentMatch) return handleAgentById(method, agentMatch[1], body)

  if (p === 'tasks') return handleTasks(method, queryParams, body)
  const taskMatch = p.match(/^tasks\/(\d+)/)
  if (taskMatch) return handleTaskById(method, parseInt(taskMatch[1]), body)

  if (p === 'logs') return handleLogs(method, queryParams, body)

  if (p === 'parliament') return handleParliament(method, body)
  const pmMatch = p.match(/^parliament\/(\d+)\/messages$/)
  if (pmMatch) return handleParliamentMessages(method, parseInt(pmMatch[1]), body)
  const psMatch = p.match(/^parliament\/(\d+)/)
  if (psMatch) return handleParliamentSession(method, parseInt(psMatch[1]))

  if (p === 'meetings') return handleMeetings(method, queryParams, body)
  if (p === 'meetings/stats/') return handleMeetingStats(method)
  const maiMatch = p.match(/^meetings\/(\d+)\/action-items$/)
  if (maiMatch) return handleMeetingActionItems(method, parseInt(maiMatch[1]), body)
  const taiMatch = p.match(/^meetings\/action-items\/(\d+)\/toggle$/)
  if (taiMatch) return handleToggleActionItem(method, parseInt(taiMatch[1]))
  const mMatch = p.match(/^meetings\/(\d+)/)
  if (mMatch) return handleMeetingById(method, parseInt(mMatch[1]), body)

  return errorResponse(`Route not found: ${p}`, 404)
}
