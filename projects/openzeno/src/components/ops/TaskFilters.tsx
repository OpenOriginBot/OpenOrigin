import { OrgAgent } from '../../types';
import styles from './TaskFilters.module.css';

interface TaskFiltersProps {
  agents: OrgAgent[];
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onAssigneeChange: (assignee: string) => void;
}

export type FilterStatus = 'all' | 'todo' | 'in_progress' | 'review' | 'done';
export type FilterPriority = 'all' | 'high' | 'medium' | 'low';

// Current user agent ID (CEO/main agent)
const CURRENT_USER_AGENT_ID = 'agent-main';

export function TaskFilters({
  agents,
  statusFilter,
  priorityFilter,
  assigneeFilter,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
}: TaskFiltersProps) {
  const isMyTasksActive = assigneeFilter === CURRENT_USER_AGENT_ID;

  return (
    <div className={styles.filters}>
      <div className={styles.quickFilters}>
        <button
          className={`${styles.quickFilterBtn} ${isMyTasksActive ? styles.active : ''}`}
          onClick={() => onAssigneeChange(isMyTasksActive ? 'all' : CURRENT_USER_AGENT_ID)}
        >
          我的任务
        </button>
        <button
          className={`${styles.quickFilterBtn} ${statusFilter !== 'all' ? styles.active : ''}`}
          onClick={() => onStatusChange(statusFilter === 'all' ? 'in_progress' : 'all')}
        >
          进行中
        </button>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>状态</label>
        <select 
          className={styles.select}
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value as FilterStatus)}
        >
          <option value="all">全部</option>
          <option value="todo">待办</option>
          <option value="in_progress">进行中</option>
          <option value="review">审核</option>
          <option value="done">已完成</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>优先级</label>
        <select 
          className={styles.select}
          value={priorityFilter}
          onChange={e => onPriorityChange(e.target.value as FilterPriority)}
        >
          <option value="all">全部</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>负责人</label>
        <select 
          className={styles.select}
          value={assigneeFilter}
          onChange={e => onAssigneeChange(e.target.value)}
        >
          <option value="all">全部</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
