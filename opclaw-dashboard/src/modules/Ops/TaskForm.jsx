import { TASK_STATUS } from '../../utils/constants';
import './TaskForm.css';

const PRIORITY_OPTIONS = [
  { value: 'high', label: '⚡ 高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export default function TaskForm({ task }) {
  return (
    <form id="task-form" className="task-form">
      <div className="form-group">
        <label>标题 *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={task?.title || ''}
          placeholder="任务名称，如：确认灯带客户订单发货时间"
        />
      </div>

      <div className="form-group">
        <label>描述</label>
        <textarea
          name="description"
          rows="3"
          defaultValue={task?.description || ''}
          placeholder="补充说明任务背景..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>状态</label>
          <select name="status" defaultValue={task?.status || 'todo'}>
            {Object.values(TASK_STATUS).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>优先级</label>
          <select name="priority" defaultValue={task?.priority || 'medium'}>
            {PRIORITY_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>截止日期</label>
          <input
            name="dueDate"
            type="date"
            defaultValue={task?.dueDate || ''}
          />
        </div>

        <div className="form-group">
          <label>负责人</label>
          <input
            name="assignee"
            type="text"
            defaultValue={task?.assignee || '小猿'}
            placeholder="如：老板、小猿"
          />
        </div>
      </div>
    </form>
  );
}
