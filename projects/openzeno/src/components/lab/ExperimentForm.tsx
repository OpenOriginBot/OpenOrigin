import { useState, useEffect } from 'react';
import { LabExperiment } from '../../types';
import styles from './ExperimentForm.module.css';

interface ExperimentFormProps {
  experiment?: LabExperiment | null;
  onSubmit: (exp: Omit<LabExperiment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function ExperimentForm({ experiment, onSubmit, onCancel }: ExperimentFormProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<LabExperiment['status']>('active');
  const [nextAction, setNextAction] = useState('');

  useEffect(() => {
    if (experiment) {
      setName(experiment.name);
      setStatus(experiment.status);
      setNextAction(experiment.nextAction);
    }
  }, [experiment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nextAction.trim()) return;
    onSubmit({ name: name.trim(), status, nextAction: nextAction.trim() });
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>{experiment ? '编辑实验' : '新建实验'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>实验名称</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：A/B测试详情页"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>状态</label>
            <select 
              className={styles.select}
              value={status}
              onChange={e => setStatus(e.target.value as LabExperiment['status'])}
            >
              <option value="active">进行中</option>
              <option value="paused">已暂停</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>下一步行动</label>
            <textarea
              className={styles.textarea}
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              placeholder="描述接下来的实验计划..."
              rows={3}
              required
            />
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              取消
            </button>
            <button type="submit" className={styles.submitBtn}>
              {experiment ? '保存修改' : '创建实验'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
