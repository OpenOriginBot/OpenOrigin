import { useState, useMemo } from 'react';
import { PMTask } from '../../types';
import { TaskHistory } from './TaskHistory';
import { formatDate, priorityColors, taskStatusColors } from '../../utils';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: PMTask;
  onUpdateStatus: (id: string, status: PMTask['status']) => void;
  onEdit: (task: PMTask) => void;
  onDelete: (id: string) => void;
}

const statusLabels: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  review: '审核',
  done: '已完成',
};

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

function getDeptColor(agentId: string): string {
  if (agentId.includes('ops')) return '#3b82f6'
  if (agentId.includes('mkt')) return '#8b5cf6'
  if (agentId.includes('rev')) return '#f59e0b'
  return '#6b7280'
}

export function TaskCard({ task, onUpdateStatus, onEdit, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const deptColor = getDeptColor(task.assigneeAgentId);

  // Calculate overdue status
  const overdueInfo = useMemo(() => {
    if (task.status === 'done') return null;
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(task.updatedAt);
    if (updatedAt < fiveDaysAgo) {
      const daysOverdue = Math.floor((now.getTime() - updatedAt.getTime()) / (24 * 60 * 60 * 1000));
      return daysOverdue;
    }
    return null;
  }, [task.status, task.updatedAt]);

  const handleStatusChange = (newStatus: PMTask['status']) => {
    onUpdateStatus(task.id, newStatus);
    setShowMenu(false);
  };

  return (
    <div
      className={`${styles.card} ${overdueInfo ? styles.overdue : ''}`}
      style={{ '--dept-color': deptColor } as React.CSSProperties}
    >
      <div className={styles.deptAccent} />
      {overdueInfo && (
        <div className={styles.overdueBadge}>
          ⚠️ 逾期 {overdueInfo} 天
        </div>
      )}

      <div className={styles.header}>
        <div 
          className={styles.statusBadge}
          style={{ backgroundColor: taskStatusColors[task.status] }}
        >
          {statusLabels[task.status]}
        </div>
        <div 
          className={styles.priorityBadge}
          style={{ color: priorityColors[task.priority] }}
        >
          {priorityLabels[task.priority]}优先级
        </div>
      </div>

      <h3 className={styles.title}>{task.title}</h3>
      
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>截止</span>
          <span className={styles.metaValue}>{formatDate(task.dueDate)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>负责人</span>
          <span className={styles.metaValue}>{task.assigneeName}</span>
        </div>
      </div>

      {task.deliverables && (
        <div className={styles.deliverables}>
          <span className={styles.metaLabel}>交付物</span>
          <span className={styles.deliverablesLink}>{task.deliverables}</span>
        </div>
      )}

      {task.notes && task.notes.length > 0 && (
        <div className={styles.notes}>
          <span className={styles.metaLabel}>最新备注</span>
          <span className={styles.noteContent}>
            {task.notes[task.notes.length - 1].content}
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <div className={styles.statusDropdown}>
          <button 
            className={styles.actionBtn}
            onClick={() => setShowMenu(!showMenu)}
          >
            状态 ▾
          </button>
          {showMenu && (
            <div className={styles.dropdownMenu}>
              {(['todo', 'in_progress', 'review', 'done'] as const).map(status => (
                <button
                  key={status}
                  className={`${styles.dropdownItem} ${task.status === status ? styles.active : ''}`}
                  onClick={() => handleStatusChange(status)}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className={styles.actionBtn} onClick={() => onEdit(task)}>编辑</button>
        {task.history && task.history.length > 0 && (
          <button 
            className={styles.actionBtn} 
            onClick={() => setShowHistory(!showHistory)}
          >
            历史 {task.history.length}
          </button>
        )}
        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => onDelete(task.id)}>删除</button>
      </div>

      {showHistory && task.history && task.history.length > 0 && (
        <TaskHistory history={task.history} />
      )}
    </div>
  );
}
