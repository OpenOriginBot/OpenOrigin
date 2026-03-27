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
  filename: string;
  title: string;
  date: string;
  content: string;
}
