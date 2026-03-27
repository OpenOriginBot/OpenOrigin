import { LabExperiment } from '../../types';
import { formatDate, experimentStatusColors } from '../../utils';
import styles from './ExperimentCard.module.css';

interface ExperimentCardProps {
  experiment: LabExperiment;
  onStatusChange: (id: string, status: LabExperiment['status']) => void;
  onDelete: (id: string) => void;
}

export function ExperimentCard({ experiment, onStatusChange, onDelete }: ExperimentCardProps) {
  const statusLabels: Record<string, string> = {
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    archived: '已归档',
  };

  return (
    <div className={styles.card}>
      <div 
        className={styles.statusBar}
        style={{ backgroundColor: experimentStatusColors[experiment.status] }}
      />
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{experiment.name}</h3>
          <span 
            className={styles.statusBadge}
            style={{ backgroundColor: experimentStatusColors[experiment.status] }}
          >
            {statusLabels[experiment.status]}
          </span>
        </div>

        <div className={styles.nextAction}>
          <span className={styles.actionLabel}>下一步：</span>
          <span className={styles.actionText}>{experiment.nextAction}</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.date}>创建于 {formatDate(experiment.createdAt)}</span>
          <div className={styles.actions}>
            <select 
              className={styles.statusSelect}
              value={experiment.status}
              onChange={e => onStatusChange(experiment.id, e.target.value as LabExperiment['status'])}
            >
              <option value="active">进行中</option>
              <option value="paused">已暂停</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
            <button 
              className={styles.deleteBtn}
              onClick={() => onDelete(experiment.id)}
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
