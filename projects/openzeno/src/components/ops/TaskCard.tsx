import { useState } from 'react';
import { OpsTask } from '../../types';
import styles from './TaskCard.module.css';
import { formatDate, priorityColors, taskStatusColors } from '../../utils';

interface TaskCardProps {
  task: OpsTask;
  onUpdateStatus: (id: string, status: OpsTask['status']) => void;
  onEdit: (task: OpsTask) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdateStatus, onEdit, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    done: '已完成',
    blocked: '已阻塞',
  };

  const priorityLabels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };

  const handleStatusChange = (newStatus: OpsTask['status']) => {
    onUpdateStatus(task.id, newStatus);
    setShowMenu(false);
  };

  return (
    <div className={styles.card}>
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

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>截止</span>
          <span className={styles.metaValue}>{formatDate(task.dueDate)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>负责人</span>
          <span className={styles.metaValue}>{task.assignee}</span>
        </div>
      </div>

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
              {(['pending', 'in_progress', 'done', 'blocked'] as const).map(status => (
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
        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => onDelete(task.id)}>删除</button>
      </div>
    </div>
  );
}
