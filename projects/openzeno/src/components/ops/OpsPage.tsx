import { useState, useMemo } from 'react';
import { useOpsTasks } from '../../hooks/useOpsTasks';
import { OpsTask } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { EmptyState, Loading } from '../common';
import styles from './OpsPage.module.css';

type FilterStatus = OpsTask['status'] | 'all';
type FilterPriority = OpsTask['priority'] | 'all';

export function OpsPage() {
  const { tasks, loading, addTask, updateTask, deleteTask, updateStatus } = useOpsTasks();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<OpsTask | null>(null);

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

  if (loading) {
    return <Loading text="加载任务中..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>运营任务</h1>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + 新建任务
        </button>
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
