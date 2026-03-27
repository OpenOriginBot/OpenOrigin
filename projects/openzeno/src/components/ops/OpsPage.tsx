import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpsTasks } from '../../hooks/useOpsTasks';
import { OpsTask } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { EmptyState, Loading } from '../common';
import { PageHeader } from '../PageHeader';
import styles from './OpsPage.module.css';

type FilterStatus = OpsTask['status'] | 'all';
type FilterPriority = OpsTask['priority'] | 'all';

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
  const { tasks, loading, addTask, updateTask, deleteTask, updateStatus } = useOpsTasks();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<OpsTask | null>(null);
  
  // Night overview state
  const [cronHealth, setCronHealth] = useState<CronHealthData | null>(null);
  const [nightOverviewLoading, setNightOverviewLoading] = useState(true);
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
  }, []);

  const assignees = useMemo(() => {
    const set = new Set(tasks.map(t => t.assignee));
    return ['all', ...Array.from(set)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'all' && task.assignee !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter]);

  const handleSubmit = (taskData: Omit<OpsTask, 'id'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEdit = (task: OpsTask) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(id);
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
        title="运营任务"
        description="管理客户交付任务，追踪状态与负责人"
        actions={
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            + 新建任务
          </button>
        }
      />

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

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>状态</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as FilterStatus)}>
            <option value="all">全部</option>
            <option value="pending">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="done">已完成</option>
            <option value="blocked">已阻塞</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>优先级</label>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as FilterPriority)}>
            <option value="all">全部</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>负责人</label>
          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
            {assignees.map(a => (
              <option key={a} value={a}>{a === 'all' ? '全部' : a}</option>
            ))}
          </select>
        </div>
      </div>

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