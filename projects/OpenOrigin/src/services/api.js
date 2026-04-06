import { API_BASE_URL, USE_MOCK_DATA } from '../config';
import {
  agents as mockAgents,
  metrics as mockMetrics,
  tasks as mockTasks,
  logEntries as mockLogs,
  parliamentSessions as mockParliament,
  meetings as mockMeetings,
  meetingStats as mockMeetingStats,
} from '../data/mockData';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// ─── Fetch wrappers ────────────────────────────────────────────────────────────

async function get(endpoint) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${endpoint}`);
  return res.json();
}

// ─── Agents ────────────────────────────────────────────────────────────────────

export async function fetchAgents() {
  if (USE_MOCK_DATA) { await delay(); return mockAgents; }
  return get('/agents/');
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export async function fetchMetrics() {
  if (USE_MOCK_DATA) { await delay(); return mockMetrics; }
  // Backend aggregates from agents + tasks
  const [agents, tasks] = await Promise.all([get('/agents/'), get('/tasks/')]);
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const online = agents.filter(a => a.status === 'online').length;
  const totalTasks = total;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  return {
    totalTasks,
    completionRate,
    onlineAgents: online,
    totalAgents: agents.length,
    uptime: '99.9%',
    eventsProcessed: 12847,
    avgResponseTime: '42ms',
  };
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function fetchTasks() {
  if (USE_MOCK_DATA) { await delay(); return mockTasks; }
  return get('/tasks/');
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export async function fetchLogs(limit = 50) {
  if (USE_MOCK_DATA) { await delay(); return mockLogs.slice(0, limit); }
  const logs = await get('/logs/');
  return logs.slice(0, limit);
}

// ─── Parliament ──────────────────────────────────────────────────────────────

export async function fetchParliament() {
  if (USE_MOCK_DATA) { await delay(); return mockParliament; }
  return get('/parliament/');
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export async function fetchMeetings() {
  if (USE_MOCK_DATA) { await delay(); return mockMeetings; }
  return get('/meetings/');
}

export async function fetchMeetingStats() {
  if (USE_MOCK_DATA) { await delay(); return mockMeetingStats; }
  // Backend aggregates
  const meetings = await get('/meetings/');
  const total = meetings.length;
  const totalHours = meetings.reduce((s, m) => s + (m.duration_minutes || 0), 0) / 60;
  const thisWeek = meetings.filter(m => {
    const d = new Date(m.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff < 7;
  }).length;
  const actionsOpen = meetings.flatMap(m => m.action_items || []).filter(a => !a.done).length;
  return {
    total,
    totalHours: Math.round(totalHours * 10) / 10,
    thisWeek,
    actionsOpen,
  };
}
