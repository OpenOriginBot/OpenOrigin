import './Badge.css';

const STATUS_CONFIG = {
  // Ops tasks
  todo: { label: '待处理', className: 'badge-gray' },
  in_progress: { label: '进行中', className: 'badge-blue' },
  done: { label: '已完成', className: 'badge-green' },
  blocked: { label: '阻塞', className: 'badge-red' },
  // Lab experiments
  active: { label: '进行中', className: 'badge-blue' },
  paused: { label: '暂停', className: 'badge-yellow' },
  completed: { label: '已完成', className: 'badge-green' },
  archived: { label: '归档', className: 'badge-gray' },
  // Priority
  high: { label: '高优', className: 'badge-red' },
  medium: { label: '中优', className: 'badge-yellow' },
  low: { label: '低优', className: 'badge-gray' },
};

export default function Badge({ status, customLabel }) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-gray' };
  return (
    <span className={`badge ${config.className}`}>
      {customLabel || config.label}
    </span>
  );
}
