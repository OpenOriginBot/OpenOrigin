import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Zap,
  Calendar,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Search,
  ChevronDown,
  Globe,
  CheckSquare,
  Sparkles,
  MessageSquare,
  Users,
  FileText,
  Play,
  Share2,
  Send,
  ChevronRight,
  Settings,
  MemoryStick,
  Pin,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import DOMPurify from 'dompurify';
import {
  agents,
  recentActivity,
  tasks,
  aiLogs,
  councilSessions,
  meetings,
  meetingTypeDistribution,
  monthlyTrendData,
  metrics,
  meetingMetrics,
} from './data/mockData';
import MemoryPanel from './components/MemoryPanel';
import { submitMemory } from './services/memoryService';
import './App.css';

const tabs = [
  { id: 'deck', label: 'Command Deck', icon: Activity },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'tasks', label: 'Task Board', icon: CheckSquare },
  { id: 'logs', label: 'AI Logs', icon: FileText },
  { id: 'council', label: 'Council', icon: MessageSquare },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'memory', label: 'Memory', icon: MemoryStick },
];

function Header() {
  const activeAgent = agents.find((a) => a.status === 'active') || agents[0];

  return (
    <header className="header glass-card">
      <div className="header-left">
        <span className="paw-icon">🐾</span>
        <div className="header-title">
          <h1>ClawBuddy</h1>
          <span className="header-subtitle">AI Agent Command Center</span>
        </div>
      </div>
      <div className="header-right">
        <div className="agent-status">
          <span className={`status-dot ${activeAgent.status}`}></span>
          <span className="agent-name">{activeAgent.name}:</span>
          <span className="agent-activity">{activeAgent.currentActivity}</span>
          <span className="agent-last-seen">Last seen: {activeAgent.lastSeen}</span>
        </div>
        <button className="settings-btn">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

function TabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <tab.icon size={16} />
          {tab.label}
        </motion.button>
      ))}
    </nav>
  );
}

function MetricCard({ icon: Icon, value, label, accent, trend, trendValue }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < value) {
        setDisplayValue(Math.floor(start));
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [value]);

  return (
    <motion.div
      ref={ref}
      className={`glass-card metric-card ${accent}`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <div className="metric-number">{displayValue}</div>
      <div className="metric-label">
        {label}
        {trend && (
          <span className={`metric-trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function CommandDeck() {
  return (
    <div className="tab-content">
      <motion.div
        className="metrics-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <MetricCard icon={Bot} value={metrics.totalAgents} label="Total Agents" accent="emerald" trend="up" trendValue="+1" />
        <MetricCard icon={Zap} value={metrics.activeTasks} label="Active Tasks" accent="cyan" trend="up" trendValue="+3" />
        <MetricCard icon={Calendar} value={metrics.meetingsToday} label="Meetings Today" accent="amber" trend="down" trendValue="-1" />
        <MetricCard icon={Bell} value={metrics.alerts} label="Alerts" accent="red" trend="up" trendValue="+2" />
      </motion.div>

      <motion.div
        className="dashboard-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="activity-feed glass-card">
          <h3>Recent Activity</h3>
          <div className="activity-list scrollbar-thin">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="activity-emoji">{activity.agent.emoji}</span>
                <div className="activity-content">
                  <p>{activity.action}</p>
                  <span className="activity-time">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="agent-status-panel glass-card">
          <h3>Agent Status</h3>
          <div className="agent-status-list">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                className="agent-status-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="agent-info">
                  <span className={`status-dot ${agent.status}`}></span>
                  <span className="agent-info-name">{agent.emoji} {agent.name}</span>
                </div>
                <p className="agent-info-activity">{agent.currentActivity}</p>
                <span className="agent-info-last-seen">{agent.lastSeen}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AgentProfiles() {
  const handleSaveAgentToMemory = async (agent, type = 'profile') => {
    const content = type === 'profile'
      ? `Agent ${agent.name} (${agent.subtitle}) - Role: ${agent.role}. Skills: ${agent.skills.join(', ')}. Completed tasks: ${agent.completedTasks}, Accuracy: ${agent.accuracy}%. Current activity: ${agent.currentActivity}`
      : `Agent ${agent.name} status update - ${agent.currentActivity}`;
    
    await submitMemory(content, 'preference', agent.name);
  };

  return (
    <div className="tab-content">
      <motion.div
        className="agent-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            className="agent-profile-card glass-card"
            style={{ '--accent': agent.accentColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="agent-card-header">
              <span className="agent-emoji-large">{agent.emoji}</span>
              <div className="agent-card-title">
                <h3>{agent.name}</h3>
                <span className="agent-subtitle">{agent.subtitle}</span>
              </div>
              <span className={`status-dot ${agent.status}`}></span>
            </div>
            <div className="agent-card-body">
              <div className="agent-meta">
                <span className="meta-item">
                  <span className="meta-label">Type</span>
                  <span className="meta-value">{agent.subtitle}</span>
                </span>
                <span className="meta-item">
                  <span className="meta-label">Role</span>
                  <span className="meta-value">{agent.role}</span>
                </span>
              </div>
              <div className="agent-stats">
                <div className="stat">
                  <span className="stat-value">{agent.completedTasks}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{agent.accuracy}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
              </div>
              <div className="agent-skills">
                {agent.skills.map((skill) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            <button className="btn btn-secondary view-details-btn" onClick={() => handleSaveAgentToMemory(agent)}>
              <Pin size={14} /> Save to Memory
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function TaskBoard() {
  const handleSaveTaskToMemory = async (task) => {
    const content = `Task: "${task.title}" - Priority: ${task.priority}. Assigned to: ${task.assignedAgent.name}. Progress: ${task.progress}%. Column: ${task.column.replace('-', ' ')}`;
    await submitMemory(content, 'project', task.assignedAgent.name);
  };
  const [boardTasks, setBoardTasks] = useState(tasks);
  const columns = [
    { id: 'todo', title: 'To Do', color: '#6b7280' },
    { id: 'in-progress', title: 'In Progress', color: '#06b6d4' },
    { id: 'needs-input', title: 'Needs Input', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' },
  ];

  const getTasksByColumn = (columnId) => boardTasks.filter((t) => t.column === columnId);

  return (
    <div className="tab-content">
      <motion.div
        className="kanban-board"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {columns.map((column) => (
          <div key={column.id} className="kanban-column">
            <div className="column-header">
              <span className="column-dot" style={{ background: column.color }}></span>
              <h3>{column.title}</h3>
              <span className="column-count">{getTasksByColumn(column.id).length}</span>
            </div>
            <div className="column-tasks scrollbar-thin">
              {getTasksByColumn(column.id).map((task, index) => (
                <motion.div
                  key={task.id}
                  className="task-card glass-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <div className="task-header">
                    <span className={`priority-dot ${task.priority}`}></span>
                    <span className={`priority-label ${task.priority}`}>{task.priority}</span>
                  </div>
                  <h4 className="task-title">{task.title}</h4>
                  <div className="task-footer">
                    <span className="task-agent">{task.assignedAgent.emoji} {task.assignedAgent.name}</span>
                    {task.progress > 0 && (
                      <div className="task-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{task.progress}%</span>
                      </div>
                    )}
                    <button
                      className="task-save-memory-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveTaskToMemory(task);
                      }}
                      title="Save to Memory"
                    >
                      <Pin size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function AILogs() {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'observation', 'general', 'reminder', 'fyi'];

  const filteredLogs = filter === 'all' ? aiLogs : aiLogs.filter((log) => log.category === filter);

  return (
    <div className="tab-content">
      <motion.div
        className="logs-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="logs-header">
          <div className="filter-group">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-pill ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="logs-list scrollbar-thin">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              className="log-entry glass-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="log-header">
                <span className={`badge ${log.category}`}>{log.category}</span>
                <span className="log-agent">{log.agent.emoji} {log.agent.name}</span>
                <span className="log-time">
                  {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                </span>
              </div>
              <p className="log-message">{log.message}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Council() {
  const [expandedSession, setExpandedSession] = useState(null);

  return (
    <div className="tab-content">
      <motion.div
        className="council-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {councilSessions.map((session, index) => (
          <motion.div
            key={session.id}
            className="council-session glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className="session-header"
              onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
            >
              <div className="session-question">
                <MessageSquare size={18} />
                <h3>{session.question}</h3>
              </div>
              <div className="session-meta">
                <span className={`status-badge ${session.status}`}>{session.status}</span>
                <div className="participant-chips">
                  {session.participants.map((p) => (
                    <span key={p.agent.id} className="participant-chip">
                      {p.agent.emoji} {p.agent.name}
                      <span className="sent-limit">({p.sent}/{p.limit})</span>
                    </span>
                  ))}
                </div>
                <ChevronDown
                  size={20}
                  className={`expand-icon ${expandedSession === session.id ? 'expanded' : ''}`}
                />
              </div>
            </div>

            <AnimatePresence>
              {expandedSession === session.id && (
                <motion.div
                  className="session-messages"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {session.messages.map((msg, msgIndex) => (
                    <motion.div
                      key={msg.id}
                      className="message"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: msgIndex * 0.05 }}
                    >
                      <span className="message-agent">
                        {msg.agent.emoji} {msg.agent.name}
                      </span>
                      <span className="message-number">#{msgIndex + 1}</span>
                      <span className="message-time">
                        {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                      </span>
                      <p className="message-text">{msg.message}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function MeetingIntelligence() {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [actionItemsFilter, setActionItemsFilter] = useState(false);
  const [externalFilter, setExternalFilter] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const meetingTypes = ['all', 'standup', 'sales', 'external', 'one-on-one', 'team', 'interview', 'all-hands', 'planning'];

  const filteredMeetings = meetings.filter((meeting) => {
    if (searchTerm && !meeting.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter !== 'all' && meeting.type !== typeFilter) return false;
    if (actionItemsFilter && meeting.action_items.filter(i => !i.done).length === 0) return false;
    if (externalFilter && !meeting.has_external_participants) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'longest') return b.duration_minutes - a.duration_minutes;
    return 0;
  });

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="tab-content meetings-tab">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="metrics-row">
          <MetricCard icon={Calendar} value={meetingMetrics.totalMeetings} label="Total Meetings" accent="emerald" trend="up" trendValue="+12%" />
          <MetricCard icon={TrendingUp} value={meetingMetrics.thisWeek} label="This Week" accent="cyan" trend="up" trendValue="+3" />
          <MetricCard icon={CheckSquare} value={meetingMetrics.openActionItems} label="Open Action Items" accent="amber" trend="down" trendValue="-4" />
          <MetricCard icon={Clock} value={34} label="Average Duration" accent="emerald" trend="up" trendValue="-2m" />
        </div>

        <div className="charts-row">
          <div className="chart-card glass-card">
            <h3>Meeting Type Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={meetingTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {meetingTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              {meetingTypeDistribution.map((item) => (
                <div key={item.name} className="legend-item">
                  <span className="legend-color" style={{ background: item.color }}></span>
                  <span className="legend-label">{item.name}</span>
                  <span className="legend-value">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card glass-card">
            <h3>Monthly Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyTrendData}>
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="meetings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="meetings-filters glass-card">
          <div className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {meetingTypes.map((type) => (
              <button
                key={type}
                className={`filter-pill ${typeFilter === type ? 'active' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {type === 'all' ? 'All Types' : type.replace('-', ' ')}
              </button>
            ))}
            <button
              className={`filter-pill ${dateFilter}`}
              onClick={() => {
                const options = ['all', '7d', '30d', '90d'];
                setDateFilter(options[(options.indexOf(dateFilter) + 1) % options.length]);
              }}
            >
              {dateFilter === 'all' ? 'All Time' : dateFilter}
            </button>
            <button
              className={`filter-pill ${actionItemsFilter ? 'active' : ''}`}
              onClick={() => setActionItemsFilter(!actionItemsFilter)}
            >
              Has Action Items
            </button>
            <button
              className={`filter-pill ${externalFilter ? 'active' : ''}`}
              onClick={() => setExternalFilter(!externalFilter)}
            >
              External Only
            </button>
          </div>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="longest">Longest Duration</option>
          </select>
        </div>

        <div className="meetings-list scrollbar-thin">
          {filteredMeetings.map((meeting, index) => (
            <motion.div
              key={meeting.id}
              className="meeting-card glass-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="meeting-header" onClick={() => setSelectedMeeting(selectedMeeting === meeting.id ? null : meeting.id)}>
                <div className="meeting-info">
                  <span className={`badge ${meeting.type}`}>{meeting.type.replace('-', ' ')}</span>
                  <h4>{meeting.title}</h4>
                  <div className="meeting-meta">
                    <span><Calendar size={14} /> {format(parseISO(meeting.date), 'MMM d, yyyy')}</span>
                    <span><Clock size={14} /> {formatDuration(meeting.duration_minutes)}</span>
                    {meeting.has_external_participants && <span><Globe size={14} /> External</span>}
                  </div>
                </div>
                <div className="meeting-right">
                  <div className="avatar-group">
                    {meeting.participants.slice(0, 3).map((p) => (
                      <div key={p} className="avatar" title={p}>{getInitials(p)}</div>
                    ))}
                    {meeting.participants.length > 3 && (
                      <div className="avatar overflow">+{meeting.participants.length - 3}</div>
                    )}
                  </div>
                  {meeting.action_items.filter(i => !i.done).length > 0 && (
                    <span className="action-items-badge">
                      <CheckSquare size={14} /> {meeting.action_items.filter(i => !i.done).length}
                    </span>
                  )}
                  <ChevronRight size={20} className={`expand-icon ${selectedMeeting === meeting.id ? 'expanded' : ''}`} />
                </div>
              </div>

              <AnimatePresence>
                {selectedMeeting === meeting.id && (
                  <motion.div
                    className="meeting-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="meeting-summary"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(meeting.summary.replace(/\n/g, '<br>').replace(/##\s(.+)/g, '<strong>$1</strong>'))
                      }}
                    />

                    <div className="action-items-section">
                      <h5><CheckSquare size={16} /> Action Items</h5>
                      <ul className="action-items-list">
                        {meeting.action_items.map((item, i) => (
                          <li key={i} className={item.done ? 'done' : ''}>
                            <span className="checkbox">{item.done ? '✓' : '○'}</span>
                            <span className="task-text">{item.task}</span>
                            <span className="task-assignee">{item.assignee}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="meeting-insights">
                      <Sparkles size={14} />
                      <span>{meeting.ai_insights}</span>
                    </div>

                    {meeting.has_external_participants && (
                      <div className="external-domains">
                        <Globe size={14} />
                        <span>External domains: {meeting.external_domains.join(', ')}</span>
                      </div>
                    )}

                    <div className="meeting-actions">
                      <button className="btn btn-secondary">
                        <Play size={16} /> Open Recording
                      </button>
                      <button className="btn btn-secondary">
                        <Share2 size={16} /> Share Link
                      </button>
                      <button className="btn btn-primary">
                        <Send size={16} /> Send to...
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('deck');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'deck':
        return <CommandDeck />;
      case 'agents':
        return <AgentProfiles />;
      case 'tasks':
        return <TaskBoard />;
      case 'logs':
        return <AILogs />;
      case 'council':
        return <Council />;
      case 'meetings':
        return <MeetingIntelligence />;
      case 'memory':
        return <MemoryPanel />;
      default:
        return <CommandDeck />;
    }
  };

  return (
    <div className="app">
      <Header />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
