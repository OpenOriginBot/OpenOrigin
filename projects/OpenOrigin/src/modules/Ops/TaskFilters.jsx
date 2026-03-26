import './TaskFilters.css';

const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待处理' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
  { value: 'blocked', label: '阻塞' },
];

export default function TaskFilters({ filter, onChange, assignees }) {
  return (
    <div className="filters">
      <input
        type="text"
        className="filter-search"
        placeholder="🔍 搜索任务..."
        value={filter.search}
        onChange={e => onChange({ ...filter, search: e.target.value })}
      />

      <div className="filter-group">
        <select
          value={filter.status}
          onChange={e => onChange({ ...filter, status: e.target.value })}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filter.assignee}
          onChange={e => onChange({ ...filter, assignee: e.target.value })}
        >
          <option value="all">全部负责人</option>
          {assignees.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
