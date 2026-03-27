// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Format date with time
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Parse markdown filename to extract date
export function parseBriefingDate(filename: string): string {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : filename.replace('.md', '');
}

// Priority color mapping
export const priorityColors: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

// Status color mapping for tasks
export const taskStatusColors: Record<string, string> = {
  pending: '#94a3b8',
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
  blocked: '#ef4444',
};

// Status color mapping for experiments
export const experimentStatusColors: Record<string, string> = {
  active: '#10b981',
  paused: '#f59e0b',
  completed: '#3b82f6',
  archived: '#6b7280',
};
