import { useState, useEffect, useCallback } from 'react';
import { OpsTask } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { generateId } from '../utils';
import initialTasks from '../data/ops-tasks.json';

const STORAGE_KEY = 'ops_tasks';

export function useOpsTasks() {
  const [tasks, setTasks] = useState<OpsTask[]>(() => 
    loadFromStorage(STORAGE_KEY, initialTasks as OpsTask[])
  );
  const [loading] = useState(false);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, tasks);
  }, [tasks]);

  const addTask = useCallback((task: Omit<OpsTask, 'id'>) => {
    const newTask = { ...task, id: generateId() };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<OpsTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateStatus = useCallback((id: string, status: OpsTask['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    updateStatus,
  };
}
