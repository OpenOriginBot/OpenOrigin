import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../PageHeader';
import { EmptyState, Loading } from '../common';
import styles from './CronHealth.module.css';

interface CronTask {
  name: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'healthy' | 'failed' | 'disabled';
  lastError: string | null;
}

interface CronStats {
  healthy: number;
  failed: number;
  disabled: number;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSchedule(schedule: string): string {
  const parts = schedule.split(' ');
  if (parts.length !== 5) return schedule;

  const [minute, hour] = parts;

  if (minute === '30' && hour === '7') return '每天 07:30';
  if (minute === '0' && hour === '2') return '每天 02:00';
  if (minute === '0' && hour === '23') return '每天 23:00';
  if (hour.includes('/')) {
    const interval = hour.split('/')[1];
    return `每 ${interval} 小时`;
  }

  return schedule;
}

export function CronHealth() {
  const [tasks, setTasks] = useState<CronTask[]>([]);
  const [stats, setStats] = useState<CronStats>({ healthy: 0, failed: 0, disabled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    loadCronHealth();
  }, []);

  const loadCronHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cron-health');
      if (!res.ok) throw new Error('Failed to load cron health');
      const data = await res.json();
      setTasks(data.tasks || []);
      setStats(data.stats || { healthy: 0, failed: 0, disabled: 0 });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="加载任务状态中..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="❌"
        title="加载失败"
        description={error}
      />
    );
  }

  const healthyTasks = tasks.filter(t => t.status === 'healthy');
  const failedTasks = tasks.filter(t => t.status === 'failed');
  const disabledTasks = tasks.filter(t => t.status === 'disabled');

  return (
    <div className={styles.page}>
      <PageHeader
        icon="⏰"
        title="定时任务健康仪表盘"
        description="监控系统定时任务的执行状态"
      />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/brain">大脑</Link>
        <span> / </span>
        <span>定时任务健康</span>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={`${styles.stat} ${styles.healthy}`}>
          <span className={styles.statValue}>{stats.healthy}</span>
          <span className={styles.statLabel}>正常</span>
        </div>
        <div className={`${styles.stat} ${styles.failed}`}>
          <span className={styles.statValue}>{stats.failed}</span>
          <span className={styles.statLabel}>失败</span>
        </div>
        <div className={`${styles.stat} ${styles.disabled}`}>
          <span className={styles.statValue}>{stats.disabled}</span>
          <span className={styles.statLabel}>已禁用</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="⏰"
          title="暂无定时任务"
          description="系统暂无配置任何定时任务。"
        />
      ) : (
        <div className={styles.taskList}>
          {/* Failed Tasks Section */}
          {failedTasks.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.dot} style={{ background: '#ef4444' }} />
                失败任务
              </h2>
              <div className={styles.tasks}>
                {failedTasks.map(task => (
                  <TaskCard
                    key={task.name}
                    task={task}
                    expanded={expandedTask === task.name}
                    onToggle={() => setExpandedTask(expandedTask === task.name ? null : task.name)}
                    onRetry={loadCronHealth}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Healthy Tasks Section */}
          {healthyTasks.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.dot} style={{ background: '#22c55e' }} />
                正常运行
              </h2>
              <div className={styles.tasks}>
                {healthyTasks.map(task => (
                  <TaskCard
                    key={task.name}
                    task={task}
                    expanded={expandedTask === task.name}
                    onToggle={() => setExpandedTask(expandedTask === task.name ? null : task.name)}
                    onRetry={loadCronHealth}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Disabled Tasks Section */}
          {disabledTasks.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.dot} style={{ background: '#9ca3af' }} />
                已禁用
              </h2>
              <div className={styles.tasks}>
                {disabledTasks.map(task => (
                  <TaskCard
                    key={task.name}
                    task={task}
                    expanded={expandedTask === task.name}
                    onToggle={() => setExpandedTask(expandedTask === task.name ? null : task.name)}
                    onRetry={loadCronHealth}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

interface TaskCardProps {
  task: CronTask;
  expanded: boolean;
  onToggle: () => void;
  onRetry: () => void;
}

function TaskCard({ task, expanded, onToggle, onRetry }: TaskCardProps) {
  const statusClass = styles[task.status];

  return (
    <div className={`${styles.taskCard} ${statusClass}`}>
      <button className={styles.taskHeader} onClick={onToggle}>
        <div className={styles.taskInfo}>
          <div className={styles.taskName}>
            <span className={`${styles.statusDot} ${statusClass}`} />
            {task.name}
          </div>
          <div className={styles.taskMeta}>
            <span className={styles.schedule}>{formatSchedule(task.schedule)}</span>
            <span className={styles.scheduleRaw}>{task.schedule}</span>
          </div>
        </div>
        <div className={styles.taskTimes}>
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>上次</span>
            <span className={styles.timeValue}>{formatDateTime(task.lastRun)}</span>
          </div>
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>下次</span>
            <span className={styles.timeValue}>{formatDateTime(task.nextRun)}</span>
          </div>
        </div>
        <div className={styles.expandIcon}>{expanded ? '−' : '+'}</div>
      </button>

      {expanded && (
        <div className={styles.taskDetails}>
          {task.lastError ? (
            <div className={styles.errorBox}>
              <div className={styles.errorHeader}>
                <span>❌ 错误信息</span>
                <button className={styles.retryBtn} onClick={onRetry}>
                  重试
                </button>
              </div>
              <pre className={styles.errorText}>{task.lastError}</pre>
            </div>
          ) : (
            <div className={styles.noError}>
              <span>✓ 任务执行正常，无错误记录</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}