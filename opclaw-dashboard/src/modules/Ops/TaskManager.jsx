import { useState, useEffect, useCallback } from 'react';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS, TASK_STATUS } from '../../utils/constants';
import { generateId, formatDate, isOverdue } from '../../utils/date';
import opsSeed from '../../data/opsSeed.json';
import {
  Card, CardBody, Badge, Button,
  Modal, EmptyState, LoadingSpinner
} from '../../components/common';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import './TaskManager.css';

const INITIAL_FILTER = {
  status: 'all',
  assignee: 'all',
  search: '',
};

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  function loadTasks() {
    try {
      const stored = storage.load(STORAGE_KEYS.OPS_TASKS);
      if (stored && stored.tasks && stored.tasks.length > 0) {
        setTasks(stored.tasks);
      } else {
        // 首次加载，用 seed 数据初始化
        setTasks(opsSeed.tasks);
        storage.save(STORAGE_KEYS.OPS_TASKS, { tasks: opsSeed.tasks });
      }
    } catch (e) {
      setError('加载任务失败：' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function persistTasks(newTasks) {
    setTasks(newTasks);
    storage.save(STORAGE_KEYS.OPS_TASKS, { tasks: newTasks });
  }

  function handleCreateTask(taskData) {
    const newTask = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    persistTasks([newTask, ...tasks]);
    setModalOpen(false);
  }

  function handleUpdateTask(taskData) {
    const updated = tasks.map(t =>
      t.id === editingTask.id ? { ...t, ...taskData } : t
    );
    persistTasks(updated);
    setEditingTask(null);
    setModalOpen(false);
  }

  function handleDeleteTask(id) {
    if (!window.confirm('确认删除此任务？')) return;
    persistTasks(tasks.filter(t => t.id !== id));
    setExpandedId(null);
  }

  function handleStatusChange(id, newStatus) {
    persistTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }

  const filteredTasks = useCallback(() => {
    return tasks.filter(task => {
      if (filter.status !== 'all' && task.status !== filter.status) return false;
      if (filter.assignee !== 'all' && task.assignee !== filter.assignee) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          (task.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, filter]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-msg">❌ {error}</div>;

  const visibleTasks = filteredTasks();
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TASK_STATUS.TODO).length,
    inProgress: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
    blocked: tasks.filter(t => t.status === TASK_STATUS.BLOCKED).length,
    done: tasks.filter(t => t.status === TASK_STATUS.DONE).length,
  };

  return (
    <div className="task-manager">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">📦 Ops</h1>
          <p className="module-subtitle">客户交付任务管理</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setModalOpen(true); }}>
          + 新建任务
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">总计</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-num">{stats.inProgress}</span>
          <span className="stat-label">进行中</span>
        </div>
        <div className="stat-card stat-red">
          <span className="stat-num">{stats.blocked}</span>
          <span className="stat-label">阻塞</span>
        </div>
        <div className="stat-card stat-gray">
          <span className="stat-num">{stats.todo}</span>
          <span className="stat-label">待处理</span>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-num">{stats.done}</span>
          <span className="stat-label">已完成</span>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters filter={filter} onChange={setFilter} assignees={[...new Set(tasks.map(t => t.assignee))]} />

      {/* Task List */}
      {visibleTasks.length === 0 ? (
        <EmptyState
          icon="📦"
          title="暂无任务"
          description="创建第一个任务，开始管理您的客户交付"
          action={<Button onClick={() => setModalOpen(true)}>新建任务</Button>}
        />
      ) : (
        <div className="task-list">
          {visibleTasks.map(task => (
            <Card key={task.id} className={`task-card ${isOverdue(task.dueDate) && task.status !== 'done' ? 'task-overdue' : ''}`}>
              <CardBody>
                <div
                  className="task-main"
                  onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                >
                  <div className="task-left">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <Badge status={task.status} />
                      <Badge status={task.priority} customLabel={task.priority === 'high' ? '⚡高优' : task.priority === 'medium' ? '中优' : '低优'} />
                      <span className={`due-date ${isOverdue(task.dueDate) && task.status !== 'done' ? 'overdue' : ''}`}>
                        📅 {formatDate(task.dueDate)}
                      </span>
                      <span className="assignee">👤 {task.assignee}</span>
                    </div>
                  </div>
                  <div className="task-chevron">{expandedId === task.id ? '▲' : '▼'}</div>
                </div>

                {expandedId === task.id && (
                  <div className="task-expanded" onClick={e => e.stopPropagation()}>
                    {task.description && <p className="task-desc">{task.description}</p>}
                    <div className="task-actions">
                      <span className="action-label">更新状态：</span>
                      {Object.values(TASK_STATUS).map(s => (
                        <Button
                          key={s}
                          size="sm"
                          variant={task.status === s ? 'primary' : 'secondary'}
                          onClick={() => handleStatusChange(task.id, s)}
                        >
                          <Badge status={s} />
                        </Button>
                      ))}
                      <div className="action-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingTask(task); setModalOpen(true); }}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        title={editingTask ? '编辑任务' : '新建任务'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button
              onClick={e => {
                e.preventDefault();
                const form = document.getElementById('task-form');
                if (!form.checkValidity()) { form.reportValidity(); return; }
                const fd = new FormData(form);
                const data = Object.fromEntries(fd.entries());
                if (editingTask) {
                  handleUpdateTask(data);
                } else {
                  handleCreateTask(data);
                }
              }}
            >
              {editingTask ? '保存修改' : '创建任务'}
            </Button>
          </>
        }
      >
        <TaskForm task={editingTask} />
      </Modal>
    </div>
  );
}
