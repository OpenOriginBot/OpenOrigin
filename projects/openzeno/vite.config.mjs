import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs'
import { execSync, exec, spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// API Plugin for lab and brain modules
function apiPlugin() {
  const dataDir = join(__dirname, 'src/data')
  const publicDir = join(__dirname, 'public')

  // Paths to real workspace files
  const workspaceDir = '/root/.openclaw/workspace'

  return {
    name: 'api-plugin',
    configureServer(server) {

      // ============================================================
      // LAB MODULE APIs (existing)
      // ============================================================

      // GET /api/prototypes
      server.middlewares.use('/api/prototypes', (_req, res) => {
        try {
          const data = readFileSync(join(dataDir, 'prototypes.json'), 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read prototypes' }))
        }
      })

      // GET /api/ideas
      server.middlewares.use('/api/ideas', (_req, res) => {
        try {
          const data = readFileSync(join(dataDir, 'ideas.json'), 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } catch {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read ideas' }))
        }
      })

      // GET /api/research/latest
      server.middlewares.use('/api/research/latest', (_req, res) => {
        try {
          const researchDir = join(publicDir, 'research')
          const files = readdirSync(researchDir).filter(f => f.endsWith('.json'))
          const allResearch = files.map(file => {
            const content = readFileSync(join(researchDir, file), 'utf-8')
            return JSON.parse(content)
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          const totalConclusions = allResearch.reduce((sum, r) => sum + (r.conclusions?.length || 0), 0)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            items: allResearch,
            totalCount: allResearch.length,
            totalConclusions,
            latestDate: allResearch[0]?.date || null
          }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read research data', details: String(e) }))
        }
      })

      // GET /api/lab/dashboard
      server.middlewares.use('/api/lab/dashboard', (_req, res) => {
        try {
          const prototypesData = JSON.parse(readFileSync(join(dataDir, 'prototypes.json'), 'utf-8'))
          const ideasData = JSON.parse(readFileSync(join(dataDir, 'ideas.json'), 'utf-8'))
          const researchDir = join(publicDir, 'research')
          const researchFiles = readdirSync(researchDir).filter(f => f.endsWith('.json'))
          const researchItems = researchFiles.map(file => {
            return JSON.parse(readFileSync(join(researchDir, file), 'utf-8'))
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          const prototypes = prototypesData.prototypes || []
          const ideas = ideasData.ideas || []

          const now = new Date()
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          weekStart.setHours(0, 0, 0, 0)

          const ideasThisWeek = ideas.filter(i => new Date(i.date) >= weekStart).length
          const latestIdea = ideas[0] || null
          const runningPrototypes = prototypes.filter(p => p.status === 'running')
          const latestRunningPrototype = runningPrototypes[0] || null

          const dashboard = {
            ideas: {
              total: ideas.length,
              thisWeek: ideasThisWeek,
              latestTitle: latestIdea?.title || null
            },
            prototypes: {
              running: runningPrototypes.length,
              total: prototypes.length,
              latestRunningName: latestRunningPrototype?.name || null
            },
            builds: {
              latestStatus: 'success',
              latestBuild: {
                id: 'build-001',
                timestamp: '2026-03-27T02:00:00Z',
                message: '原型构建完成，AI 客服模块 v2.1.0',
                status: 'success'
              }
            },
            research: {
              latestDate: researchItems[0]?.date || null,
              conclusionCount: researchItems.reduce((sum, r) => sum + (r.conclusions?.length || 0), 0),
              totalProjects: researchItems.length
            }
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(dashboard))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to build dashboard', details: String(e) }))
        }
      })

      // ============================================================
      // BRAIN MODULE APIs
      // ============================================================

      // GET /api/memory/stats - get memory directory statistics
      server.middlewares.use('/api/memory/stats', (_req, res) => {
        try {
          const memoryDir = join(workspaceDir, 'memory')
          let stats = {
            totalFiles: 0,
            totalSize: 0,
            lastUpdated: null,
            newestFile: null
          }

          try {
            const entries = readdirSync(memoryDir).filter(f => f.endsWith('.md'))
            
            if (entries.length > 0) {
              let newestFile = null
              let newestTime = 0
              let totalSize = 0

              for (const filename of entries) {
                const filePath = join(memoryDir, filename)
                const stats = statSync(filePath)
                totalSize += stats.size
                
                if (stats.mtimeMs > newestTime) {
                  newestTime = stats.mtimeMs
                  newestFile = filename
                }
              }

              stats = {
                totalFiles: entries.length,
                totalSize,
                lastUpdated: new Date(newestTime).toISOString(),
                newestFile
              }
            }
          } catch (e) {
            // Directory doesn't exist or is empty
            if (e.code !== 'ENOENT') {
              throw e
            }
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(stats))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read memory stats', details: String(e) }))
        }
      })

      // GET /api/memory/files - list memory files
      server.middlewares.use('/api/memory/files', (_req, res) => {
        try {
          const memoryDir = join(workspaceDir, 'memory')
          let files = []

          try {
            const entries = readdirSync(memoryDir).filter(f => f.endsWith('.md'))

            files = entries.map(filename => {
              const filePath = join(memoryDir, filename)
              const stats = statSync(filePath)

              return {
                name: filename,
                date: stats.mtime.toISOString().split('T')[0],
                size: stats.size,
                pinned: filename === 'MEMORY.md' || filename === 'BACKLOG.md'
              }
            })

            // Sort: pinned first, then by date descending
            files.sort((a, b) => {
              if (a.pinned && !b.pinned) return -1
              if (!a.pinned && b.pinned) return 1
              return b.date.localeCompare(a.date)
            })
          } catch (e) {
            // Directory doesn't exist or is empty - return empty array
            files = []
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ files }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read memory files', details: String(e) }))
        }
      })

      // GET /api/memory/file?path=xxx - get file content
      server.middlewares.use('/api/memory/file', (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const requestedPath = url.searchParams.get('path')

          if (!requestedPath) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing path parameter' }))
            return
          }

          // Security: only allow paths within memory directory
          const memoryDir = join(workspaceDir, 'memory')
          const filePath = join(memoryDir, requestedPath)
          const normalizedPath = filePath.replace(/\\/g, '/')

          if (!normalizedPath.startsWith(memoryDir)) {
            res.statusCode = 403
            res.end(JSON.stringify({ error: 'Access denied' }))
            return
          }

          const content = readFileSync(filePath, 'utf-8')
          res.setHeader('Content-Type', 'text/plain')
          res.end(content)
        } catch (e) {
          if (e.code === 'ENOENT') {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'File not found' }))
          } else {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to read file', details: String(e) }))
          }
        }
      })

      // GET /api/briefs - list briefings with stats
      server.middlewares.use('/api/briefs', (_req, res) => {
        try {
          const briefsDir = join(workspaceDir, 'briefings')
          let briefs = []

          try {
            const entries = readdirSync(briefsDir).filter(f => f.endsWith('.md'))

            briefs = entries.map(filename => {
              const filePath = join(briefsDir, filename)
              const content = readFileSync(filePath, 'utf-8')
              const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
              const date = dateMatch ? dateMatch[1] : filename.replace('.md', '')

              // Extract title from first heading or use date
              const titleMatch = content.match(/^#\s+(.+)$/m)
              const title = titleMatch ? titleMatch[1] : '简报 ' + date

              // Extract first 150 chars as summary
              const summary = content
                .replace(/^#.*$/gm, '')
                .replace(/[*_`#]/g, '')
                .trim()
                .substring(0, 150)
                + (content.length > 150 ? '...' : '')

              return {
                id: date,
                date,
                title,
                sent: true,
                summary,
                content
              }
            })

            // Sort by date descending
            briefs.sort((a, b) => b.date.localeCompare(a.date))
          } catch (e) {
            briefs = []
          }

          // Calculate stats
          const now = new Date()
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          weekStart.setHours(0, 0, 0, 0)

          const stats = {
            total: briefs.length,
            thisWeek: briefs.filter(b => new Date(b.date) >= weekStart).length,
            lastSent: briefs.length > 0 ? briefs[0].date : null
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ briefs, stats }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read briefings', details: String(e) }))
        }
      })

      // GET /api/skills - list skills
      server.middlewares.use('/api/skills', (_req, res) => {
        try {
          const skillsDir = join(workspaceDir, 'skills')
          let skills = []

          // First try to read index.json
          try {
            const indexPath = join(skillsDir, 'index.json')
            const indexData = JSON.parse(readFileSync(indexPath, 'utf-8'))
            skills = indexData.skills || []
          } catch (e) {
            // No index.json, try to scan directories
            try {
              const entries = readdirSync(skillsDir)
              for (const entry of entries) {
                const skillDir = join(skillsDir, entry)
                try {
                  const stat = statSync(skillDir)
                  if (stat.isDirectory()) {
                    const skillMdPath = join(skillDir, 'SKILL.md')
                    try {
                      const content = readFileSync(skillMdPath, 'utf-8')
                      const idMatch = content.match(/\*\*技能ID\*\*[^\n]*`([^`]+)`/)
                      const nameMatch = content.match(/^#\s+技能：(.+?)\s+\(/m)
                      const catMatch = content.match(/\*\*分类\*\*[^\n]*([^\n]+)/)
                      const statusMatch = content.match(/\*\*状态\*\*[^\n]*(\w+)/)

                      skills.push({
                        id: idMatch ? idMatch[1] : 'skill-' + entry,
                        name: nameMatch ? nameMatch[1] : entry,
                        category: catMatch ? catMatch[1].trim() : 'general',
                        status: statusMatch ? statusMatch[1] : 'active',
                        description: content.substring(0, 200),
                        source: 'custom',
                        referencedBy: []
                      })
                    } catch (e2) {
                      // No SKILL.md in this directory
                    }
                  }
                } catch (e2) {
                  // Skip
                }
              }
            } catch (e2) {
              skills = []
            }
          }

          // Add source type (built-in vs custom)
          const builtInSkills = ['healthcheck', 'node-connect', 'skill-creator', 'weather']
          skills = skills.map(s => ({
            ...s,
            source: builtInSkills.includes(s.id) ? 'built-in' : 'custom'
          }))

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ skills }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read skills', details: String(e) }))
        }
      })

      // ============================================================
      // PM BOARD APIs
      // ============================================================

      // Helper: read PM tasks
      const readPmtasks = () => {
        try {
          return JSON.parse(readFileSync(join(dataDir, 'pm-tasks.json'), 'utf-8'))
        } catch {
          return []
        }
      }

      // Helper: write PM tasks
      const writePmtasks = (tasks) => {
        writeFileSync(join(dataDir, 'pm-tasks.json'), JSON.stringify(tasks, null, 2))
      }

      // GET /api/org-chart - simplified org chart for dropdown
      server.middlewares.use('/api/org-chart', (_req, res) => {
        try {
          const orgChartPath = join(workspaceDir, 'team/data/org-chart.json')
          const orgChart = JSON.parse(readFileSync(orgChartPath, 'utf-8'))
          
          // Return simplified departments list with emoji prefixes
          const agents = orgChart.departments.map(dept => {
            const emoji = dept.id === 'agent-ops-head' ? '⏱️' : 
                          dept.id === 'agent-mkt-head' ? '✨' : '💰'
            return {
              id: dept.id.replace('agent-', ''), // ops-head, mkt-head, rev-head
              agentId: dept.id,
              name: `${emoji} ${dept.name}`,
              department: dept.department,
              role: dept.role
            }
          })

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ agents }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read org chart', details: String(e) }))
        }
      })

      // Consolidated PM Board handler - handles all /api/pm-board/* routes
      server.middlewares.use('/api/pm-board', (req, res) => {
        // Use originalUrl to get full path, req.url is after mount point
        const url = new URL(req.originalUrl || req.url, 'http://localhost')
        const pathname = url.pathname
        const method = req.method
        const pathSegments = pathname.split('/').filter(Boolean) // ['api', 'pm-board', ...]

        try {
          // POST /api/pm-board/create - create new task
          if (method === 'POST' && pathSegments.length === 3 && pathSegments[2] === 'create') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              const data = JSON.parse(body)
              const tasks = readPmtasks()

              const newTask = {
                id: 'task-' + Date.now().toString(36) + Math.random().toString(36).substring(2),
                title: data.title,
                description: data.description || '',
                assigneeAgentId: data.assigneeAgentId,
                assigneeName: data.assigneeName || data.assigneeAgentId,
                status: data.status || 'todo',
                priority: data.priority || 'medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                dueDate: data.dueDate,
                deliverables: data.deliverables || '',
                notes: [],
                history: []
              }

              tasks.unshift(newTask)
              writePmtasks(tasks)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(newTask))
            })
            return
          }

          // GET/PATCH /api/pm-board/:id - get or update single task
          // Match paths like /api/pm-board/task-001
          if (pathSegments.length === 3) {
            // pathSegments = ['api', 'pm-board', 'task-001']
            const id = pathSegments[2]
            const tasks = readPmtasks()
            const taskIndex = tasks.findIndex(t => t.id === id)

            if (taskIndex === -1) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Task not found' }))
              return
            }

            if (method === 'GET') {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(tasks[taskIndex]))
              return
            }

            if (method === 'PATCH') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', () => {
                const data = JSON.parse(body)
                const task = tasks[taskIndex]
                const operator = data.operator || 'system'

                // Track history for status changes
                if (data.status && data.status !== task.status) {
                  task.history = task.history || []
                  task.history.push({
                    field: 'status',
                    from: task.status,
                    to: data.status,
                    timestamp: new Date().toISOString(),
                    operator
                  })
                  task.status = data.status
                }

                // Track history for other field changes
                if (data.assigneeAgentId && data.assigneeAgentId !== task.assigneeAgentId) {
                  task.history = task.history || []
                  task.history.push({
                    field: 'assignee',
                    from: task.assigneeName,
                    to: data.assigneeName || data.assigneeAgentId,
                    timestamp: new Date().toISOString(),
                    operator
                  })
                  task.assigneeAgentId = data.assigneeAgentId
                  task.assigneeName = data.assigneeName || data.assigneeAgentId
                }

                if (data.priority && data.priority !== task.priority) {
                  task.history = task.history || []
                  task.history.push({
                    field: 'priority',
                    from: task.priority,
                    to: data.priority,
                    timestamp: new Date().toISOString(),
                    operator
                  })
                  task.priority = data.priority
                }

                // Add note if provided
                if (data.note) {
                  task.notes = task.notes || []
                  task.notes.push({
                    content: data.note,
                    timestamp: new Date().toISOString(),
                    operator
                  })
                }

                // Update other fields
                if (data.title) task.title = data.title
                if (data.description !== undefined) task.description = data.description
                if (data.dueDate) task.dueDate = data.dueDate
                if (data.deliverables !== undefined) task.deliverables = data.deliverables

                // Always update updatedAt
                task.updatedAt = new Date().toISOString()

                tasks[taskIndex] = task
                writePmtasks(tasks)

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(task))
              })
              return
            }
          }

          // GET /api/pm-board - list all tasks with stats and filtering
          if (method === 'GET') {
            const assigneeFilter = url.searchParams.get('assignee')
            const statusFilter = url.searchParams.get('status')
            const priorityFilter = url.searchParams.get('priority')

            let tasks = readPmtasks()

            // Apply filters
            if (assigneeFilter && assigneeFilter !== 'all') {
              tasks = tasks.filter(t => t.assigneeAgentId === assigneeFilter)
            }
            if (statusFilter && statusFilter !== 'all') {
              tasks = tasks.filter(t => t.status === statusFilter)
            }
            if (priorityFilter && priorityFilter !== 'all') {
              tasks = tasks.filter(t => t.priority === priorityFilter)
            }

            // Calculate stats
            const now = new Date()
            const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

            const stats = {
              total: tasks.length,
              byStatus: { todo: 0, in_progress: 0, review: 0, done: 0 },
              byPriority: { high: 0, medium: 0, low: 0 },
              overdue: 0
            }

            for (const task of tasks) {
              stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1
              stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
              
              // Check overdue: updatedAt > 5 days ago and not done
              if (task.status !== 'done') {
                const updatedAt = new Date(task.updatedAt)
                if (updatedAt < fiveDaysAgo) {
                  stats.overdue++
                }
              }
            }

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ tasks, stats }))
            return
          }

          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to process request', details: String(e) }))
        }
      })

      // GET /api/cron-health - get cron health status with backup info
      server.middlewares.use('/api/cron-health', (_req, res) => {
        try {
          const crontabPath = join(workspaceDir, 'scripts/cron/openzclaw-crontab')
          const logsDir = join(workspaceDir, 'scripts/logs')
          const backupLogsDir = join(workspaceDir, 'scripts/cron/backup')

          let tasks = []
          let stats = { healthy: 0, failed: 0, disabled: 0 }
          let backupStatus = { lastBackup: null, status: 'unknown', filesBackedUp: 0 }

          // Try to read backup status from backup script's last run
          // First check the dedicated backup logs directory
          try {
            const backupLogFiles = readdirSync(backupLogsDir).filter(f => f.endsWith('.log'))
            if (backupLogFiles.length > 0) {
              // Get most recent backup log
              const sortedLogs = backupLogFiles.sort()
              const latestLog = sortedLogs[sortedLogs.length - 1]
              const logPath = join(backupLogsDir, latestLog)
              const logContent = readFileSync(logPath, 'utf-8')
              
              // Parse last backup time from log
              const timestampMatch = logContent.match(/^\[?(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/)
              if (timestampMatch) {
                backupStatus.lastBackup = timestampMatch[1]
              }
              
              // Check for success/failure
              if (logContent.includes('备份完成') || logContent.includes('Backup completed') || logContent.includes('备份成功')) {
                backupStatus.status = 'success'
              } else if (logContent.includes('失败') || logContent.includes('FAILURE') || logContent.includes('failed')) {
                backupStatus.status = 'failed'
              }
              
              // Try to count files backed up
              const filesMatch = logContent.match(/(\d+)\s*文件/)
              if (filesMatch) {
                backupStatus.filesBackedUp = parseInt(filesMatch[1], 10)
              }
            }
          } catch (e) {
            // Backup logs directory doesn't exist or is empty - try the main logs directory
          }
          
          // Check main logs directory for backup cron logs
          if (backupStatus.lastBackup === null) {
            try {
              const allLogFiles = readdirSync(logsDir).filter(f => f.includes('backup') && f.endsWith('.log'))
              if (allLogFiles.length > 0) {
                const sortedLogs = allLogFiles.sort()
                const latestLog = sortedLogs[sortedLogs.length - 1]
                const logPath = join(logsDir, latestLog)
                const logContent = readFileSync(logPath, 'utf-8')
                
                const timestampMatch = logContent.match(/^\[?(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/)
                if (timestampMatch) {
                  backupStatus.lastBackup = timestampMatch[1]
                }
                
                if (logContent.includes('备份完成') || logContent.includes('Backup completed') || logContent.includes('备份成功')) {
                  backupStatus.status = 'success'
                } else if (logContent.includes('失败') || logContent.includes('FAILURE') || logContent.includes('failed')) {
                  backupStatus.status = 'failed'
                }
                
                const filesMatch = logContent.match(/(\d+)\s*文件/)
                if (filesMatch) {
                  backupStatus.filesBackedUp = parseInt(filesMatch[1], 10)
                }
              }
            } catch (e) {
              // Logs directory doesn't exist either
            }
          }

          try {
            // Parse crontab
            const crontab = readFileSync(crontabPath, 'utf-8')
            const taskDefs = []
            let currentTask = null

            for (const line of crontab.split('\n')) {
              // Match task definition lines like "# 任务 1：私有仓库备份"
              const taskMatch = line.match(/^#\s*任务\s*\d+[：:]\s*(.+)/)
              if (taskMatch) {
                currentTask = { name: taskMatch[1].trim() }
              }
              // Match cron schedule lines
              else if (line.trim().startsWith('*') || line.trim().match(/^\d/)) {
                const scheduleMatch = line.match(/^(\S+\s+\S+\s+\S+\s+\S+\s+\S+)/)
                const taskNameMatch = line.match(/\/([^\/]+)\.sh\s+>>/i)

                if (scheduleMatch && currentTask) {
                  currentTask.schedule = scheduleMatch[1]
                  const nameFromLine = taskNameMatch ? taskNameMatch[1].replace('.sh', '') : null
                  if (nameFromLine && !currentTask.name.includes(nameFromLine)) {
                    currentTask.name = currentTask.name + ' (' + nameFromLine + ')'
                  }
                  taskDefs.push(currentTask)
                  currentTask = null
                }
              }
            }

            // Read log files to determine task status
            let logFiles = []
            try {
              logFiles = readdirSync(logsDir).filter(f => f.endsWith('.log'))
            } catch (e) {
              // Logs directory doesn't exist
            }

            // For each task, determine status from logs
            tasks = taskDefs.map(def => {
              // Find matching log file
              const logFileName = def.name.split(' ')[0].toLowerCase().replace(/[()（）：:]/g, '') + '.log'
              let lastRun = null
              let lastError = null
              let status = 'healthy'

              for (const logFile of logFiles) {
                try {
                  const logPath = join(logsDir, logFile)
                  const logContent = readFileSync(logPath, 'utf-8')
                  const lines = logContent.split('\n').filter(l => l.trim())

                  // Get last line as last run info
                  if (lines.length > 0) {
                    const lastLine = lines[lines.length - 1]
                    const timestampMatch = lastLine.match(/^\[?(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/)
                    if (timestampMatch) {
                      lastRun = timestampMatch[1]
                    }
                    // Check for error indicators
                    if (lastLine.toLowerCase().includes('error') || lastLine.toLowerCase().includes('failed')) {
                      lastError = lastLine.substring(0, 200)
                      status = 'failed'
                    }
                  }
                } catch (e) {
                  // Can't read this log file
                }
              }

              if (status === 'healthy') stats.healthy++
              else if (status === 'failed') stats.failed++
              else stats.disabled++

              // Calculate next run (simple: add 24 hours to last run or use schedule)
              let nextRun = null
              if (lastRun) {
                try {
                  const lastRunDate = new Date(lastRun)
                  lastRunDate.setHours(lastRunDate.getHours() + 24)
                  nextRun = lastRunDate.toISOString()
                } catch (e) {
                  nextRun = null
                }
              }

              return {
                name: def.name,
                schedule: def.schedule || '0 0 * * *',
                lastRun,
                nextRun,
                status,
                lastError
              }
            })

          } catch (e) {
            // Crontab doesn't exist - return empty
            if (e.code !== 'ENOENT') {
              throw e
            }
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ tasks, stats, backupStatus }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to read cron health', details: String(e) }))
        }
      })

      // ============================================================
      // MEETINGS APIs
      // ============================================================

      // GET /api/meetings - list all meetings
      server.middlewares.use('/api/meetings', (req, res) => {
        try {
          const meetingsDir = join(workspaceDir, 'team/meetings')
          const url = new URL(req.originalUrl || req.url, 'http://localhost')
          const pathname = url.pathname
          const method = req.method
          const pathSegments = pathname.split('/').filter(Boolean) // ['api', 'meetings', ...]

          // GET /api/meetings/:date - get single meeting
          if (method === 'GET' && pathSegments.length === 3) {
            const date = pathSegments[2]
            const meetingPath = join(meetingsDir, `${date}-每日同步会议.md`)
            
            try {
              const content = readFileSync(meetingPath, 'utf-8')
              res.setHeader('Content-Type', 'text/plain')
              res.end(content)
            } catch (e) {
              if (e.code === 'ENOENT') {
                res.statusCode = 404
                res.end(JSON.stringify({ error: 'Meeting not found' }))
              } else {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Failed to read meeting', details: String(e) }))
              }
            }
            return
          }

          // GET /api/meetings - list all meetings (no date specified)
          if (method === 'GET' && pathSegments.length === 2) {
            let meetings = []

            try {
              const entries = readdirSync(meetingsDir).filter(f => f.endsWith('.md'))

              meetings = entries.map(filename => {
                const filePath = join(meetingsDir, filename)
                const stats = statSync(filePath)
                const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
                const date = dateMatch ? dateMatch[1] : filename.replace('.md', '')

                // Extract title and summary from content
                const content = readFileSync(filePath, 'utf-8')
                const titleMatch = content.match(/^#\s+高管晨会纪要\s+-\s+(.+)$/m)
                const title = titleMatch ? titleMatch[1] : '会议纪要 ' + date

                // Extract attendance info
                const attendanceMatch = content.match(/出席\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+)/)
                const attendance = attendanceMatch ? {
                  ops: attendanceMatch[1].replace(/\\+$/, '').trim(),
                  mkt: attendanceMatch[2].replace(/\\+$/, '').trim(),
                  rev: attendanceMatch[3].replace(/\\+$/, '').trim()
                } : null

                // Extract duration
                const durationMatch = content.match(/时长\s*\|\s*[^}]*?(\d+)\s*分钟/)
                const duration = durationMatch ? parseInt(durationMatch[1], 10) : null

                return {
                  id: date,
                  date,
                  title,
                  attendance,
                  duration,
                  createdAt: stats.mtime.toISOString(),
                  file: filename
                }
              })

              // Sort by date descending
              meetings.sort((a, b) => b.date.localeCompare(a.date))
            } catch (e) {
              if (e.code !== 'ENOENT') {
                throw e
              }
              meetings = []
            }

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ meetings }))
            return
          }

          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to process request', details: String(e) }))
        }
      })

      // ============================================================
      // TEAM STATUS APIs (real agent data)
      // ============================================================

      // GET /api/team/status - get real-time agent status
      server.middlewares.use('/api/team/status', async (_req, res) => {
        try {
          const orgChartPath = join(workspaceDir, 'team/data/org-chart.json')
          const orgChart = JSON.parse(readFileSync(orgChartPath, 'utf-8'))
          const pmTasksPath = join(dataDir, 'pm-tasks.json')
          const pmTasks = JSON.parse(readFileSync(pmTasksPath, 'utf-8'))

          // Determine online agents by checking the openclaw agents directory
          // All registered agents are considered online if their workspace dirs exist
          const agentsDir = '/root/.openclaw/agents'
          const onlineAgents = new Set()
          try {
            const entries = readdirSync(agentsDir)
            for (const entry of entries) {
              const agentPath = join(agentsDir, entry)
              try {
                if (statSync(agentPath).isDirectory()) {
                  // Normalize: strip 'agent-' prefix if present
                  const normalizedId = entry.replace(/^agent-/, '')
                  onlineAgents.add(normalizedId)
                }
              } catch (e) {
                // Skip
              }
            }
          } catch (e) {
            // Fallback: assume all org-chart agents are online
            for (const dept of orgChart.departments) {
              onlineAgents.add(dept.id.replace('agent-', ''))
            }
          }

          // Department emoji mapping
          const deptEmoji = {
            'agent-ops-head': '⏱️',
            'agent-mkt-head': '✨',
            'agent-rev-head': '💰',
          }
          const deptColor = {
            'agent-ops-head': '#3b82f6',
            'agent-mkt-head': '#8b5cf6',
            'agent-rev-head': '#f59e0b',
          }

          // Build agent list enriched with status
          const agents = orgChart.departments.map(dept => {
            const isOnline = onlineAgents.has(dept.id)
            // Find recent activity from pm tasks notes
            const agentTasks = pmTasks.filter(t => t.assigneeAgentId === dept.id)
            const latestNote = agentTasks
              .flatMap(t => t.notes || [])
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

            // Calculate completion rate for this agent
            const doneTasks = agentTasks.filter(t => t.status === 'done').length
            const totalTasks = agentTasks.length
            const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : null

            return {
              id: dept.id.replace('agent-', ''),
              name: `${deptEmoji[dept.id] || '👤'} ${dept.name}`,
              emoji: deptEmoji[dept.id] || '👤',
              department: dept.department,
              status: isOnline ? 'online' : 'offline',
              lastHeartbeat: new Date().toISOString(),
              model: 'MiniMax-M2.7',
              recentActivity: latestNote ? latestNote.content.substring(0, 60) : null,
              completionRate,
              color: deptColor[dept.id] || '#6b7280',
            }
          })

          const onlineCount = agents.filter(a => a.status === 'online').length
          const offlineCount = agents.length - onlineCount

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            agents,
            stats: {
              online: onlineCount,
              offline: offlineCount
            }
          }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to get team status', details: String(e) }))
        }
      })

      // GET /api/team/delegate-queue - tasks assigned but not started
      server.middlewares.use('/api/team/delegate-queue', (_req, res) => {
        try {
          const pmTasksPath = join(dataDir, 'pm-tasks.json')
          const pmTasks = JSON.parse(readFileSync(pmTasksPath, 'utf-8'))

          // Filter: status is 'todo' (assigned but not started)
          const queuedTasks = pmTasks
            .filter(t => t.status === 'todo')
            .map(t => {
              const createdAt = new Date(t.createdAt)
              const now = new Date()
              const daysInQueue = Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000))
              return {
                id: t.id,
                title: t.title,
                assigneeName: t.assigneeName,
                assigneeAgentId: t.assigneeAgentId,
                priority: t.priority,
                daysInQueue,
                createdAt: t.createdAt,
                dueDate: t.dueDate,
              }
            })
            .sort((a, b) => b.daysInQueue - a.daysInQueue)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ tasks: queuedTasks }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to get delegate queue', details: String(e) }))
        }
      })

      // GET /api/team/meeting-summary - recent meeting summary for BrainHub
      server.middlewares.use('/api/team/meeting-summary', (_req, res) => {
        try {
          const meetingsDir = join(workspaceDir, 'team/meetings')
          const meetings = []

          try {
            const entries = readdirSync(meetingsDir).filter(f => f.endsWith('.md'))
            for (const filename of entries) {
              const filePath = join(meetingsDir, filename)
              const content = readFileSync(filePath, 'utf-8')
              const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
              const date = dateMatch ? dateMatch[1] : filename.replace('.md', '')
              meetings.push({ date, content })
            }
          } catch (e) {
            // No meetings dir
          }

          // Sort by date descending
          meetings.sort((a, b) => b.date.localeCompare(a.date))

          if (meetings.length === 0) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ meeting: null }))
            return
          }

          const latest = meetings[0]
          const content = latest.content

          // Extract decisions (lines with "决策" or "决定")
          const decisionLines = []
          const lines = content.split('\n')
          let inDecisionSection = false
          for (const line of lines) {
            if (line.includes('##') && (line.includes('决策') || line.includes('决定'))) {
              inDecisionSection = true
              continue
            }
            if (inDecisionSection && line.startsWith('##')) {
              inDecisionSection = false
            }
            if (inDecisionSection && line.trim()) {
              decisionLines.push(line.replace(/^[-*]\s*/, '').trim())
            }
          }

          // Extract attendance
          const attendanceMatch = content.match(/出席\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+)/)
          const attendance = attendanceMatch ? {
            ops: attendanceMatch[1].replace(/\\+$/, '').trim(),
            mkt: attendanceMatch[2].replace(/\\+$/, '').trim(),
            rev: attendanceMatch[3].replace(/\\+$/, '').trim(),
          } : null

          // Calculate meeting round number
          const roundMatch = latest.date.match(/(\d{4})-(\d{2})-(\d{2})/)
          let round = 1
          if (roundMatch) {
            const meetingDates = meetings.map(m => m.date)
            round = meetingDates.indexOf(latest.date) + 1
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            meeting: {
              date: latest.date,
              round,
              attendance,
              decisions: decisionLines.slice(0, 5),
              totalDecisions: decisionLines.length,
            }
          }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Failed to get meeting summary', details: String(e) }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    port: 8800,
    host: '127.0.0.1',
    allowedHosts: ['oz.120619.xyz', 'localhost', '127.0.0.1']
  }
})