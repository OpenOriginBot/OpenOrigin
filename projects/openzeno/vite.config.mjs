import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
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