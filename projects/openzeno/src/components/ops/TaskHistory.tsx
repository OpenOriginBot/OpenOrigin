import { PMTaskHistoryEntry } from '../../types';
import styles from './TaskHistory.module.css';

interface TaskHistoryProps {
  history: PMTaskHistoryEntry[];
}

const fieldLabels: Record<string, string> = {
  status: '状态',
  assignee: '负责人',
  priority: '优先级',
};

const statusLabels: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  review: '审核',
  done: '已完成',
};

export function TaskHistory({ history }: TaskHistoryProps) {
  if (!history || history.length === 0) {
    return null;
  }

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (field: string, value: string) => {
    if (field === 'status') {
      return statusLabels[value] || value;
    }
    return value;
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>变更历史</h4>
      <div className={styles.list}>
        {history.map((entry, index) => (
          <div key={index} className={styles.entry}>
            <span className={styles.timestamp}>{formatTimestamp(entry.timestamp)}</span>
            <span className={styles.field}>{fieldLabels[entry.field] || entry.field}</span>
            <span className={styles.change}>
              {formatValue(entry.field, entry.from)} → {formatValue(entry.field, entry.to)}
            </span>
            <span className={styles.operator}>{entry.operator}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
