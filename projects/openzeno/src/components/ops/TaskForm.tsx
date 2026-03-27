import { useState, useEffect } from 'react';
import { PMTask } from '../../types';
import { OrgChartSelect } from './OrgChartSelect';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  task?: PMTask | null;
  onSubmit: (task: Omit<PMTask, 'id'>) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PMTask['status']>('todo');
  const [dueDate, setDueDate] = useState('');
  const [assigneeAgentId, setAssigneeAgentId] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [priority, setPriority] = useState<PMTask['priority']>('medium');
  const [deliverables, setDeliverables] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setDueDate(task.dueDate);
      setAssigneeAgentId(task.assigneeAgentId);
      setAssigneeName(task.assigneeName);
      setPriority(task.priority);
      setDeliverables(task.deliverables || '');
    }
  }, [task]);

  const handleAssigneeChange = (agentId: string, agentName: string) => {
    setAssigneeAgentId(agentId);
    setAssigneeName(agentName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !assigneeAgentId) return;
    onSubmit({ 
      title: title.trim(), 
      description: description.trim(),
      status, 
      dueDate, 
      assigneeAgentId,
      assigneeName,
      priority,
      deliverables: deliverables.trim(),
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: task?.notes || [],
      history: task?.history || []
    });
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

          <div className={styles.field}>
            <label className={styles.label}>任务描述</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="详细描述任务内容"
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>状态</label>
              <select 
                className={styles.select}
                value={status}
                onChange={e => setStatus(e.target.value as PMTask['status'])}
              >
                <option value="todo">待办</option>
                <option value="in_progress">进行中</option>
                <option value="review">审核</option>
                <option value="done">已完成</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>优先级</label>
              <select 
                className={styles.select}
                value={priority}
                onChange={e => setPriority(e.target.value as PMTask['priority'])}
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
              <OrgChartSelect
                value={assigneeAgentId}
                onChange={handleAssigneeChange}
                className={styles.select}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>交付物链接</label>
            <input
              type="text"
              className={styles.input}
              value={deliverables}
              onChange={e => setDeliverables(e.target.value)}
              placeholder="任务交付物链接（可选）"
            />
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
