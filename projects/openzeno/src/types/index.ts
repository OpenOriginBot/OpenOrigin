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