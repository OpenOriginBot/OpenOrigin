/**
 * OpenOrigin API - Supabase REST (PostgREST) version
 * Uses Supabase's built-in REST API instead of direct PostgreSQL
 */

const SB_URL = 'https://fippycifijhcmsrxoylr.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcHB5Y2lmaWpoY21zcnhveWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTU2NjgsImV4cCI6MjA5MDk3MTY2OH0.CM2zy328XkxfiMa7rZPZS59XZfX7j_PK2wZiC8f5nAY'

const HEADERS = {
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

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

function parseBody(body) {
  if (!body) return {}
  if (typeof body === 'string') {
    try { return JSON.parse(body) } catch { return {} }
  }
  return body
}

async function sbGet(table, params = {}) {
  const url = new URL(`${SB_URL}/rest/v1/${table}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await // @ts-ignore
    globalThis.fetch(url.toString(), { headers: HEADERS, method: 'GET' })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GET ${table} failed: ${res.status} ${err}`)
  }
  return res.json()
}

async function sbPost(table, data) {
  const res = await // @ts-ignore
    globalThis.fetch(`${SB_URL}/rest/v1/${table}`, {
    headers: HEADERS,
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`POST ${table} failed: ${res.status} ${err}`)
  }
  const text = await res.text()
  if (res.headers.get('content-type')?.includes('application/json')) {
    return text ? JSON.parse(text) : []
  }
  return []
}

async function sbPatch(table, params, data) {
  const url = new URL(`${SB_URL}/rest/v1/${table}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('select', '*')
  const res = await // @ts-ignore
    globalThis.fetch(url.toString(), {
    headers: HEADERS,
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PATCH ${table} failed: ${res.status} ${err}`)
  }
  return res.json()
}

async function sbDelete(table, params = {}) {
  const url = new URL(`${SB_URL}/rest/v1/${table}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await // @ts-ignore
    globalThis.fetch(url.toString(), { headers: HEADERS, method: 'DELETE' })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DELETE ${table} failed: ${res.status} ${err}`)
  }
  return []
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function ensureInit() { /* REST API — no init needed */ }

// ─── Agents ────────────────────────────────────────────────────────────────────
async function handleAgents(method, queryParams, body) {
  if (method === 'GET') {
    const rows = await sbGet('agents', { select: '*', order: 'name' })
    return jsonResponse(rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { id, emoji = '🤖', name, subtitle, type, role, color = '#10b981', status = 'offline', current_activity, last_seen, completed_tasks = 0, accuracy = 0, skills = [] } = d
    const rows = await sbPost('agents', {
      id, emoji, name, subtitle, type, role, color, status,
      current_activity, last_seen: last_seen || new Date().toISOString(),
      completed_tasks, accuracy,
      skills: Array.isArray(skills) ? skills : [],
    })
    return jsonResponse(rows[0] || rows, 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleAgentById(method, agentId, body) {
  if (method === 'GET') {
    const rows = await sbGet('agents', { id: `eq.${agentId}`, select: '*' })
    if (!rows.length) return errorResponse('Agent not found', 404)
    return jsonResponse(rows[0])
  }
  if (method === 'PUT') {
    const d = parseBody(body)
    const updates = {}
    const keys = ['emoji','name','subtitle','type','role','color','status','current_activity','last_seen','completed_tasks','accuracy']
    keys.forEach(k => { if (d[k] !== undefined) updates[k] = d[k] })
    if (d.skills !== undefined) updates.skills = Array.isArray(d.skills) ? d.skills : []
    if (!Object.keys(updates).length) {
      const rows = await sbGet('agents', { id: `eq.${agentId}`, select: '*' })
      return jsonResponse(rows[0])
    }
    try {
      const rows = await sbPatch('agents', { id: `eq.${agentId}` }, updates)
      if (!rows.length) return errorResponse('Agent not found', 404)
      return jsonResponse(rows[0])
    } catch (e) {
      if (e.message.includes('404')) return errorResponse('Agent not found', 404)
      throw e
    }
  }
  if (method === 'DELETE') {
    try {
      await sbDelete('agents', { id: `eq.${agentId}` })
      return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }
    } catch (e) {
      if (e.message.includes('404')) return errorResponse('Agent not found', 404)
      throw e
    }
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Tasks ─────────────────────────────────────────────────────────────────────
async function handleTasks(method, queryParams, body) {
  if (method === 'GET') {
    const { col } = queryParams
    const params = { select: '*,agent:id,name,emoji,color' }
    if (col) params.col = `eq.${col}`
    const rows = await sbGet('tasks', params)
    return jsonResponse(rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { title, agent_id, priority = 'medium', col = 'todo', progress = 0 } = d
    const rows = await sbPost('tasks', { title, agent_id, priority, col, progress })
    return jsonResponse(rows[0] || rows, 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleTaskById(method, taskId, body) {
  if (method === 'GET') {
    const rows = await sbGet('tasks', { id: `eq.${taskId}`, select: '*,agent:id,name,emoji,color' })
    if (!rows.length) return errorResponse('Task not found', 404)
    return jsonResponse(rows[0])
  }
  if (method === 'PUT') {
    const d = parseBody(body)
    const updates = {}
    ;['title','agent_id','priority','col','progress'].forEach(k => {
      if (d[k] !== undefined) updates[k] = d[k]
    })
    if (!Object.keys(updates).length) {
      const rows = await sbGet('tasks', { id: `eq.${taskId}`, select: '*' })
      return jsonResponse(rows[0])
    }
    try {
      const rows = await sbPatch('tasks', { id: `eq.${taskId}` }, updates)
      if (!rows.length) return errorResponse('Task not found', 404)
      return jsonResponse(rows[0])
    } catch (e) {
      if (e.message.includes('404')) return errorResponse('Task not found', 404)
      throw e
    }
  }
  if (method === 'DELETE') {
    try {
      await sbDelete('tasks', { id: `eq.${taskId}` })
      return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }
    } catch (e) {
      if (e.message.includes('404')) return errorResponse('Task not found', 404)
      throw e
    }
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Logs ──────────────────────────────────────────────────────────────────────
async function handleLogs(method, queryParams, body) {
  if (method === 'GET') {
    const { category, limit = 50 } = queryParams
    const params = { select: '*', order: 'time.desc', limit }
    if (category) params.category = `eq.${category}`
    const rows = await sbGet('log_entries', params)
    return jsonResponse(rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { agent_id, agent, category = 'general', message } = d
    const rows = await sbPost('log_entries', { agent_id, agent, category, message })
    return jsonResponse(rows[0] || rows, 201)
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Parliament ─────────────────────────────────────────────────────────────────
async function handleParliament(method, body) {
  if (method === 'GET') {
    const sessions = await sbGet('parliament_sessions', {
      select: '*,participants(*),parliament_messages(*)',
      order: 'id.desc'
    })
    return jsonResponse(sessions)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const { question, status = 'deliberating', participants = [], messages = [] } = d
    // Insert session
    const sessionRows = await sbPost('parliament_sessions', { question, status })
    const session = Array.isArray(sessionRows) ? sessionRows[0] : sessionRows
    const sessionId = session.id
    // Insert participants
    for (const p of participants) {
      await sbPost('participants', {
        session_id: sessionId,
        agent: p.agent || null,
        name: p.name,
        stance: p.stance || 'conditional',
        status: p.status || 'active'
      })
    }
    // Insert messages
    for (const m of messages) {
      await sbPost('parliament_messages', {
        session_id: sessionId,
        agent: m.agent || null,
        name: m.name,
        text: m.text
      })
    }
    // Fetch complete session
    const complete = await sbGet('parliament_sessions', {
      id: `eq.${sessionId}`,
      select: '*,participants(*),parliament_messages(*)'
    })
    return jsonResponse(complete[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleParliamentSession(method, sessionId) {
  if (method === 'GET') {
    const rows = await sbGet('parliament_sessions', {
      id: `eq.${sessionId}`,
      select: '*,participants(*),parliament_messages(*)'
    })
    if (!rows.length) return errorResponse('Session not found', 404)
    return jsonResponse(rows[0])
  }
  return errorResponse('Method not allowed', 405)
}

async function handleParliamentMessages(method, sessionId, body) {
  if (method === 'POST') {
    const d = parseBody(body)
    const { agent, name, text } = d
    // Verify session exists
    const sessions = await sbGet('parliament_sessions', { id: `eq.${sessionId}`, select: 'id' })
    if (!sessions.length) return errorResponse('Session not found', 404)
    const rows = await sbPost('parliament_messages', { session_id: parseInt(sessionId), agent, name, text })
    return jsonResponse(rows[0] || rows, 201)
  }
  return errorResponse('Method not allowed', 405)
}

// ─── Meetings ───────────────────────────────────────────────────────────────────
async function handleMeetings(method, queryParams, body) {
  if (method === 'GET') {
    const { meeting_type } = queryParams
    const params = { select: '*,action_items(*)', order: 'date.desc' }
    if (meeting_type) params.meeting_type = `eq.${meeting_type}`
    const rows = await sbGet('meetings', params)
    return jsonResponse(rows)
  }
  if (method === 'POST') {
    const d = parseBody(body)
    const {
      title, date, duration_minutes = 0, meeting_type,
      participants = [], summary, ai_insights,
      has_external_participants = false, external_domains = [],
      sentiment = 'neutral', action_items = []
    } = d

    const meetingRows = await sbPost('meetings', {
      title, date, duration_minutes, meeting_type,
      participants: Array.isArray(participants) ? participants : [],
      summary, ai_insights,
      has_external_participants,
      external_domains: Array.isArray(external_domains) ? external_domains : [],
      sentiment
    })
    const meeting = Array.isArray(meetingRows) ? meetingRows[0] : meetingRows
    const meetingId = meeting.id

    for (const item of action_items) {
      await sbPost('action_items', {
        meeting_id: meetingId,
        task: item.task,
        assignee: item.assignee || null,
        done: item.done || false
      })
    }

    const complete = await sbGet('meetings', {
      id: `eq.${meetingId}`,
      select: '*,action_items(*)'
    })
    return jsonResponse(complete[0], 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleMeetingStats(method) {
  if (method !== 'GET') return errorResponse('Method not allowed', 405)
  const [total, open, avg] = await Promise.all([
    sbGet('meetings', { select: 'id' }),
    sbGet('action_items', { done: 'eq.false', select: 'id' }),
    // @ts-ignore
    globalThis.fetch(`${SB_URL}/rest/v1/rpc/avg_duration`, {
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      method: 'GET',
    }).then(r => r.ok ? r.json() : [{ avg: 0 }]).catch(() => [{ avg: 0 }])
  ])
  return jsonResponse({
    total: total.length,
    this_week: 0,
    open_actions: open.length,
    avg_duration: 0,
  })
}

async function handleMeetingById(method, meetingId, body) {
  if (method === 'GET') {
    const rows = await sbGet('meetings', {
      id: `eq.${meetingId}`,
      select: '*,action_items(*)'
    })
    if (!rows.length) return errorResponse('Meeting not found', 404)
    return jsonResponse(rows[0])
  }
  if (method === 'PUT') {
    const d = parseBody(body)
    const updates = {}
    ;['title','date','duration_minutes','meeting_type','summary','ai_insights','sentiment','has_external_participants'].forEach(k => {
      if (d[k] !== undefined) updates[k] = d[k]
    })
    if (d.participants !== undefined) updates.participants = Array.isArray(d.participants) ? d.participants : []
    if (d.external_domains !== undefined) updates.external_domains = Array.isArray(d.external_domains) ? d.external_domains : []
    if (!Object.keys(updates).length) {
      const rows = await sbGet('meetings', { id: `eq.${meetingId}`, select: '*' })
      return jsonResponse(rows[0])
    }
    try {
      const rows = await sbPatch('meetings', { id: `eq.${meetingId}` }, updates)
      if (!rows.length) return errorResponse('Meeting not found', 404)
      return jsonResponse(rows[0])
    } catch (e) {
      if (e.message.includes('404')) return errorResponse('Meeting not found', 404)
      throw e
    }
  }
  if (method === 'DELETE') {
    try {
      await sbDelete('meetings', { id: `eq.${meetingId}` })
      return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }
    } catch (e) {
      if (e.message.includes('404')) return errorResponse('Meeting not found', 404)
      throw e
    }
  }
  return errorResponse('Method not allowed', 405)
}

async function handleMeetingActionItems(method, meetingId, body) {
  if (method === 'POST') {
    const d = parseBody(body)
    // Verify meeting exists
    const meetings = await sbGet('meetings', { id: `eq.${meetingId}`, select: 'id' })
    if (!meetings.length) return errorResponse('Meeting not found', 404)
    const rows = await sbPost('action_items', {
      meeting_id: parseInt(meetingId),
      task: d.task,
      assignee: d.assignee || null,
      done: d.done || false
    })
    return jsonResponse(rows[0] || rows, 201)
  }
  return errorResponse('Method not allowed', 405)
}

async function handleToggleActionItem(method, itemId) {
  if (method !== 'PATCH') return errorResponse('Method not allowed', 405)
  const items = await sbGet('action_items', { id: `eq.${itemId}`, select: 'done' })
  if (!items.length) return errorResponse('Action item not found', 404)
  const newDone = !items[0].done
  const rows = await sbPatch('action_items', { id: `eq.${itemId}` }, { done: newDone })
  return jsonResponse(rows[0])
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
export default async function handler(req) {
  try {
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
  } catch (e) {
    return errorResponse(e.message || 'Internal error', 500)
  }
}
