#!/usr/bin/env node
// sync-memory-to-supabase.js
// 同步 memory/*.md 文件到 Supabase memory 表

import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const MEMORY_DIR = '/Users/liam/.openclaw/workspace/memory';

// Supabase 直接连接
const SB_URL = 'https://fippycifijhcmsrxoylr.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcHB5Y2lmaWpoY21zcnhveWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTU2NjgsImV4cCI6MjA5MDk3MTY2OH0.CM2zy328XkxfiMa7rZPZS59XZfX7j_PK2wZiC8f5nAY';

async function sbPost(table, data) {
  const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

// 从文件名提取日期
function parseDate(filename) {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
  return m ? m[1] : null;
}

// 提取待办事项
function extractTodos(content) {
  const todos = [];
  const re = /- \[ \] (.+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    todos.push(m[1].trim());
  }
  return todos;
}

// 提取 cron 任务状态
function extractCronStatus(content) {
  const lines = content.split('\n');
  const tasks = [];
  for (const line of lines) {
    if (line.match(/[✅❌]/) && (line.includes('Cron') || line.includes('任务'))) {
      const status = line.match(/[✅❌]/)?.[0];
      const name = line.replace(/[✅❌]/g, '').replace(/\|/g, '').trim().split(/\s{2,}/)[0];
      if (status && name) tasks.push({ name: name.slice(0, 50), status: status === '✅' ? 'ok' : 'error' });
    }
  }
  return tasks;
}

// 解析 memory 文件
function parseMemoryFile(filepath, filename) {
  const date = parseDate(filename);
  if (!date) return null;

  const raw = readFileSync(filepath, 'utf-8');
  const todoMatch = raw.match(/## 📅 今日优先事项\n([\s\S]*?)(?=## |$)/);
  const systemMatch = raw.match(/## 📊 系统状态([\s\S]*?)(?=## |$)/);

  const todos = todoMatch ? extractTodos(todoMatch[1]) : [];
  const cronStatus = systemMatch ? extractCronStatus(systemMatch[1]) : [];

  return {
    date,
    raw: raw.slice(0, 3000),
    todos,
    cronStatus,
    synced_at: new Date().toISOString(),
  };
}

async function main() {
  const files = readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('briefing-'))
    .sort();

  console.log(`找到 ${files.length} 个 memory 文件`);
  let synced = 0;
  let skipped = 0;

  for (const file of files) {
    const filepath = join(MEMORY_DIR, file);
    const parsed = parseMemoryFile(filepath, file);
    if (!parsed) { skipped++; continue; }

    const entry = {
      agent_name: 'openclaw',
      category: '日常',
      content: JSON.stringify({
        date: parsed.date,
        todos: parsed.todos,
        cronStatus: parsed.cronStatus,
        synced_at: parsed.synced_at,
        summary: `待办${parsed.todos.length}项，Cron异常${parsed.cronStatus.filter(t => t.status === 'error').length}个`,
      }),
      approved: false,
    };

    try {
      const result = await sbPost('memory', entry);
      if (result.error) {
        console.log(`❌ ${file}: ${JSON.stringify(result.error)}`);
      } else {
        console.log(`✅ ${file}: 同步成功 (${parsed.todos.length}待办, ${parsed.cronStatus.length}Cron状态)`);
        synced++;
      }
    } catch (e) {
      console.log(`❌ ${file}: ${e.message}`);
    }
  }

  console.log(`\n完成: ${synced} 成功, ${skipped} 跳过`);
}

main().catch(console.error);
