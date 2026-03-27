import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePMTasks } from '../../hooks/usePMTasks';
import { PMTask, AgentStatus, TeamStatusResponse } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskFilters, FilterStatus, FilterPriority } from './TaskFilters';
import { EmptyState, Loading } from '../common';
import { PageHeader } from '../PageHeader';
import { AgentStatusCard } from '../team';
import styles from './OpsPage.module.css';

// Night overview data types
interface BackupStatus {
  lastBackup: string;
  status: string;
  filesBackedUp?: number;
}

interface CronHealthData {
  stats?: {
    healthy: number;
    failed: number;
    disabled: number;
  };
  backupStatus?: BackupStatus;
}

export function OpsPage() {
  const { tasks, stats, agents, loading, addTask, updateTask, deleteTask, updateStatus } = usePMTasks();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<PMTask | null>(null);
  
  // Night overview state
  const [cronHealth, setCronHealth] = useState<CronHealthData | null>(null);
  const [nightOverviewLoading, setNightOverviewLoading] = useState(true);
  const [teamAgents, setTeamAgents] = useState<AgentStatus[]>([]);
  const [showOrgChart, setShowOrgChart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cron health for night overview
    fetch('/api/cron-health')
      .then(r => r.json())
      .then(data => {
        setCronHealth(data);
        setNightOverviewLoading(false);
      })
      .catch(() => {
        setNightOverviewLoading(false);
      });

    // Fetch team status for org chart
    fetch('/api/team/status')
      .then(r => r.json())
      .then((data: TeamStatusResponse) => {
        setTeamAgents(data.agents);
      })
      .catch(() => {});
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'all' && task.assigneeAgentId !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter]);

  const handleSubmit = async (taskData: Omit<PMTask, 'id'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEdit = (task: PMTask) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      await deleteTask(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Format date for display
  const formatBackupTime = (isoString: string) => {
    if (!isoString) return '无记录';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return <Loading text="加载任务中..." />;
  }

  return (
    <div className={styles.page}>
      <PageHeader
        icon="📋"
        title="项目管理看板"
        description="多智能体团队唯一可信数据源"
        actions={
          <div className={styles.headerActions}>
            <button
              className={`${styles.orgChartBtn} ${showOrgChart ? styles.active : ''}`}
              onClick={() => setShowOrgChart(!showOrgChart)}
            >
              {showOrgChart ? '隐藏组织架构' : '显示组织架构'}
            </button>
            <button className={styles.addBtn} onClick={() => setShowForm(true)}>
              + 新建任务
            </button>
          </div>
        }
      />

      {/* Org Chart Section */}
      {showOrgChart && (
        <div className={styles.orgChartSection}>
          <div className={styles.orgChartTitle}>🏢 组织架构</div>
          <div className={styles.orgChartGrid}>
            {teamAgents.map(agent => (
              <AgentStatusCard
                key={agent.id}
                agent={agent}
                onClick={() => {
                  // Filter tasks by this agent
                  setAssigneeFilter(agent.id);
                  setShowOrgChart(false);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>总任务</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.todo}`}>{stats.byStatus?.todo || 0}</span>
            <span className={styles.statLabel}>待办</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.inProgress}`}>{stats.byStatus?.in_progress || 0}</span>
            <span className={styles.statLabel}>进行中</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.review}`}>{stats.byStatus?.review || 0}</span>
            <span className={styles.statLabel}>审核</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.done}`}>{stats.byStatus?.done || 0}</span>
            <span className={styles.statLabel}>已完成</span>
          </div>
          <div className={`${styles.statCard} ${styles.overdue}`}>
            <span className={styles.statValue}>{stats.overdue || 0}</span>
            <span className={styles.statLabel}>逾期</span>
          </div>
        </div>
      )}

      {/* Agent Completion Rate Stats */}
      {teamAgents.length > 0 && (
        <div className={styles.completionStats}>
          <span className={styles.completionTitle}>📊 各主管任务完成率</span>
          <div className={styles.completionGrid}>
            {teamAgents.map(agent => (
              <div
                key={agent.id}
                className={styles.completionItem}
                style={{ '--dept-color': agent.color } as React.CSSProperties}
              >
                <span className={styles.completionName}>{agent.emoji} {agent.name.replace(/^[⏱️✨💰]\s*/, '')}</span>
                <div className={styles.completionBar}>
                  <div
                    className={styles.completionFill}
                    style={{ width: `${agent.completionRate ?? 0}%` }}
                  />
                </div>
                <span className={styles.completionValue}>
                  {agent.completionRate !== null ? `${agent.completionRate}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Night Overview Section */}
      <div className={styles.nightOverview}>
        <div className={styles.nightOverviewTitle}>🌙 夜间概览</div>
        
        {nightOverviewLoading ? (
          <div className={styles.nightOverviewLoading}>加载中...</div>
        ) : (
          <div className={styles.nightOverviewGrid}>
            {/* Cron Task Status */}
            <div className={styles.nightOverviewCard}>
              <div className={styles.nightOverviewCardLabel}>定时任务</div>
              {cronHealth?.stats ? (
                <div className={styles.nightOverviewStats}>
                  <span className={styles.nightOverviewStat}>
                    <span className={`${styles.statValue} ${styles.healthy}`}>{cronHealth.stats.healthy}</span>
                    <span className={styles.statLabel}>正常</span>
                  </span>
                  {cronHealth.stats.failed > 0 && (
                    <span 
                      className={styles.nightOverviewLink}
                      onClick={() => navigate('/brain/cron')}
                      title="点击查看详情"
                    >
                      <span className={`${styles.statValue} ${styles.failed}`}>{cronHealth.stats.failed}</span>
                      <span className={styles.statLabel}>失败</span>
                      <span className={styles.linkHint}>→ 查看</span>
                    </span>
                  )}
                  <span className={styles.nightOverviewStat}>
                    <span className={styles.statValue}>{cronHealth.stats.disabled}</span>
                    <span className={styles.statLabel}>禁用</span>
                  </span>
                </div>
              ) : (
                <div className={styles.nightOverviewEmpty}>暂无数据</div>
              )}
            </div>

            {/* Backup Status */}
            <div className={styles.nightOverviewCard}>
              <div className={styles.nightOverviewCardLabel}>备份状态</div>
              {cronHealth?.backupStatus ? (
                <div className={styles.backupStatus}>
                  <span className={styles.backupTime}>
                    {formatBackupTime(cronHealth.backupStatus.lastBackup)}
                  </span>
                  <span className={`${styles.backupIndicator} ${
                    cronHealth.backupStatus.status === 'success' ? styles.success : styles.error
                  }`}>
                    {cronHealth.backupStatus.status === 'success' ? '✅' : '❌'}
                  </span>
                  {cronHealth.backupStatus.filesBackedUp && (
                    <span className={styles.backupFiles}>
                      {cronHealth.backupStatus.filesBackedUp} 文件
                    </span>
                  )}
                </div>
              ) : (
                <div className={styles.nightOverviewEmpty}>
                  最后备份: {formatBackupTime(cronHealth?.backupStatus?.lastBackup || '')}
                </div>
              )}
            </div>

            {/* Service Status */}
            <div className={styles.nightOverviewCard}>
              <div className={styles.nightOverviewCardLabel}>服务状态</div>
              <div className={styles.serviceStatus}>
                <span className={styles.serviceIndicator}>🟢</span>
                <span className={styles.serviceLabel}>正常</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <TaskFilters
        agents={agents}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        assigneeFilter={assigneeFilter}
        onStatusChange={v => setStatusFilter(v as FilterStatus)}
        onPriorityChange={v => setPriorityFilter(v as FilterPriority)}
        onAssigneeChange={setAssigneeFilter}
      />

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title={tasks.length === 0 ? '暂无任务' : '没有符合筛选条件的任务'}
          description={tasks.length === 0 ? '点击「新建任务」创建第一个运营任务' : '尝试调整筛选条件'}
          action={tasks.length === 0 ? { label: '新建任务', onClick: () => setShowForm(true) } : undefined}
        />
      ) : (
        <div className={styles.grid}>
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={updateStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
