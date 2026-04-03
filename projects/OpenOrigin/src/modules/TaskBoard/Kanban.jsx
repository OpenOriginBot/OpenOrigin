import { useState } from 'react';
import { motion } from 'framer-motion';
import { tasks as initialTasks } from '../../data/mockData';

const COLUMNS = [
  { id: 'todo', label: '待办', color: '#6b7280' },
  { id: 'progress', label: '执行中', color: '#06b6d4' },
  { id: 'input', label: '需要输入', color: '#f59e0b' },
  { id: 'done', label: '完成', color: '#10b981' },
];

const priorityColors = {
  low: '#6b7280', medium: '#06b6d4', high: '#f59e0b', urgent: '#ef4444',
};
const priorityLabels = { low: '低', medium: '中', high: '高', urgent: '紧急' };

export default function Kanban() {
  const [tasks, setTasks] = useState(initialTasks);
  const [dragging, setDragging] = useState(null);

  const moveTask = (taskId, newCol) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, col: newCol } : t));
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>任务板</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, alignItems: 'start' }}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.col === col.id);
          return (
            <div key={col.id}>
              {/* Column Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 10, padding: '0 4px',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '1px 7px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.07)', fontSize: 11, color: 'var(--color-text-muted)',
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.map(task => (
                  <motion.div
                    key={task.id}
                    className="glass-card"
                    style={{ padding: 14, cursor: 'grab' }}
                    draggable
                    onDragStart={() => setDragging(task.id)}
                    onDragEnd={e => {
                      e.preventDefault();
                      setDragging(null);
                      const col = Object.values(COLUMNS).find(c =>
                        c.id !== task.col
                      );
                      if (col) moveTask(task.id, col.id);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    {/* Priority + Agent */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 10,
                        background: `${priorityColors[task.priority]}15`,
                        color: priorityColors[task.priority],
                        fontWeight: 500,
                      }}>
                        {priorityLabels[task.priority]}
                      </span>
                      <span style={{ fontSize: 14 }}>{task.agent}</span>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: task.progress != null ? 10 : 0 }}>
                      {task.title}
                    </div>

                    {/* Progress */}
                    {task.progress != null && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>进度</span>
                          <span style={{ fontSize: 11, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>{task.progress}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${task.progress}%`,
                            background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                          }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
