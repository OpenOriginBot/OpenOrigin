import { useState, useEffect } from 'react';
import { OpsTask } from '../../types';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  task?: OpsTask | null;
  onSubmit: (task: Omit<OpsTask, 'id'>) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<OpsTask['status']>('pending');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<OpsTask['priority']>('medium');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setStatus(task.status);
      setDueDate(task.dueDate);
      setAssignee(task.assignee);
      setPriority(task.priority);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !assignee.trim()) return;
    onSubmit({ title: title.trim(), status, dueDate, assignee: assignee.trim(), priority });
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>{task ? '编辑任务' : '新建任务'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>任务标题</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="输入任务描述"
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>状态</label>
              <select 
                className={styles.select}
                value={status}
                onChange={e => setStatus(e.target.value as OpsTask['status'])}
              >
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="done">已完成</option>
                <option value="blocked">已阻塞</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>优先级</label>
              <select 
                className={styles.select}
                value={priority}
                onChange={e => setPriority(e.target.value as OpsTask['priority'])}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>截止日期</label>
              <input
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>负责人</label>
              <input
                type="text"
                className={styles.input}
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                placeholder="输入负责人姓名"
                required
              />
            </div>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              取消
            </button>
            <button type="submit" className={styles.submitBtn}>
              {task ? '保存修改' : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
