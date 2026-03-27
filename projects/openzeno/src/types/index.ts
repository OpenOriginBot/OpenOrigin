// Ops Task Types
export interface OpsTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  dueDate: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
}

// Lab Experiment Types
export interface LabExperiment {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  nextAction: string;
  createdAt: string;
}

// Briefing Types
export interface Briefing {
  id: string;
  date: string;
  title?: string;
  sent: boolean;
  summary: string;
  content?: string;
}

// Briefing Stats
export interface BriefingStats {
  total: number;
  thisWeek: number;
  lastSent: string | null;
}

// Memory Stats
export interface MemoryStats {
  totalFiles: number;
  totalSize: number;
  lastUpdated: string | null;
  newestFile: string | null;
}

// Cron Health Types
export interface CronTask {
  name: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'healthy' | 'failed' | 'disabled';
  lastError: string | null;
}

export interface CronStats {
  healthy: number;
  failed: number;
  disabled: number;
}

export interface BackupStatus {
  lastBackup: string | null;
  status: 'success' | 'failed' | 'unknown';
  filesBackedUp?: number;
}

// Skill Types
export interface Skill {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  status: string;
  description: string;
  source: 'built-in' | 'custom';
  tags?: string[];
  owner?: string;
  version?: string;
  updatedAt?: string;
  referencedBy?: string[];
}

// PM Task Types
export interface PMTask {
  id: string;
  title: string;
  description: string;
  assigneeAgentId: string;
  assigneeName: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  deliverables: string;
  notes: PMTaskNote[];
  history: PMTaskHistoryEntry[];
}

export interface PMTaskNote {
  content: string;
  timestamp: string;
  operator: string;
}

export interface PMTaskHistoryEntry {
  field: string;
  from: string;
  to: string;
  timestamp: string;
  operator: string;
}

export interface PMStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
}

export interface PMBoardResponse {
  tasks: PMTask[];
  stats: PMStats;
}

export interface OrgAgent {
  id: string;
  agentId: string;
  name: string;
  department: string;
  role: string;
}

// Team Status Types
export interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  department: string;
  status: 'online' | 'offline';
  lastHeartbeat: string;
  model: string;
  recentActivity: string | null;
  completionRate: number | null;
  color: string;
}

export interface TeamStatusResponse {
  agents: AgentStatus[];
  stats: {
    online: number;
    offline: number;
  };
}

export interface DelegateQueueTask {
  id: string;
  title: string;
  assigneeName: string;
  assigneeAgentId: string;
  priority: 'high' | 'medium' | 'low';
  daysInQueue: number;
  createdAt: string;
  dueDate: string;
}

export interface DelegateQueueResponse {
  tasks: DelegateQueueTask[];
}

export interface MeetingSummary {
  date: string;
  round: number;
  attendance: {
    ops: string;
    mkt: string;
    rev: string;
  } | null;
  decisions: string[];
  totalDecisions: number;
}

export interface MeetingSummaryResponse {
  meeting: MeetingSummary | null;
}