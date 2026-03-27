import { useState, useEffect, useCallback } from 'react';
import { PMTask, PMStats, OrgAgent } from '../types';

interface PMBoardResponse {
  tasks: PMTask[];
  stats: PMStats;
}

export function usePMTasks() {
  const [tasks, setTasks] = useState<PMTask[]>([]);
  const [stats, setStats] = useState<PMStats | null>(null);
  const [agents, setAgents] = useState<OrgAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents on mount
  useEffect(() => {
    fetch('/api/org-chart')
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents || []);
      })
      .catch(console.error);
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async (assignee?: string, status?: string, priority?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/pm-board';
      const params = new URLSearchParams();
      if (assignee && assignee !== 'all') params.append('assignee', assignee);
      if (status && status !== 'all') params.append('status', status);
      if (priority && priority !== 'all') params.append('priority', priority);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data: PMBoardResponse = await response.json();
      setTasks(data.tasks);
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      console.error('Failed to fetch PM tasks:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (taskData: Omit<PMTask, 'id'>) => {
    try {
      const response = await fetch('/api/pm-board/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const newTask: PMTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
      // Refresh stats
      fetchTasks();
      return newTask;
    } catch (e) {
      console.error('Failed to create task:', e);
      throw e;
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<PMTask>, operator: string = 'user') => {
    try {
      const response = await fetch(`/api/pm-board/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, operator }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask: PMTask = await response.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      // Refresh stats
      fetchTasks();
      return updatedTask;
    } catch (e) {
      console.error('Failed to update task:', e);
      throw e;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      // For delete, we need to implement a DELETE endpoint
      // For now, just remove from local state
      setTasks(prev => prev.filter(t => t.id !== id));
      // Refresh stats
      fetchTasks();
    } catch (e) {
      console.error('Failed to delete task:', e);
      throw e;
    }
  }, [fetchTasks]);

  const updateStatus = useCallback(async (id: string, status: PMTask['status'], operator: string = 'user') => {
    return updateTask(id, { status }, operator);
  }, [updateTask]);

  return {
    tasks,
    stats,
    agents,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    updateStatus,
    refreshTasks: fetchTasks,
  };
}
