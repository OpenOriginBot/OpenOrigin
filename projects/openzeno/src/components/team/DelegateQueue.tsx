import { useState, useEffect } from 'react';
import { DelegateQueueTask, DelegateQueueResponse } from '../../types';
import styles from './DelegateQueue.module.css';

export function DelegateQueue() {
  const [tasks, setTasks] = useState<DelegateQueueTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/team/delegate-queue');
        const data: DelegateQueueResponse = await res.json();
        setTasks(data.tasks);
      } catch (e) {
        console.error('Failed to fetch delegate queue:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, []);

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>📋 委派队列</span>
          <span className={styles.loading}>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>📋 委派队列</span>
        <span className={styles.count}>{tasks.length} 项待启动</span>
      </div>

      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🎉</span>
          <span className={styles.emptyText}>暂无待启动任务</span>
        </div>
      ) : (
        <div className={styles.taskList}>
          {tasks.map(task => (
            <div key={task.id} className={styles.taskItem} style={{ '--dept-color': getDeptColor(task.assigneeAgentId) } as React.CSSProperties}>
              <div className={styles.taskMain}>
                <span className={styles.assigneeName}>{task.assigneeName}</span>
                <span className={styles.taskTitle}>{task.title}</span>
              </div>
              <div className={styles.taskMeta}>
                <span className={`${styles.priorityBadge} ${styles[task.priority]}`}>
                  {task.priority === 'high' ? '高优' : task.priority === 'medium' ? '中优' : '低优'}
                </span>
                <span className={`${styles.queueBadge} ${task.daysInQueue > 3 ? styles.urgent : ''}`}>
                  {task.daysInQueue === 0 ? '今日' : `等待 ${task.daysInQueue} 天`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDeptColor(agentId: string): string {
  if (agentId.includes('ops')) return '#3b82f6'
  if (agentId.includes('mkt')) return '#8b5cf6'
  if (agentId.includes('rev')) return '#f59e0b'
  return '#6b7280'
}
