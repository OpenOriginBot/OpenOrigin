import { useState, useEffect, useCallback } from 'react';
import { LabExperiment } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { generateId } from '../utils';
import initialExperiments from '../data/lab-experiments.json';

const STORAGE_KEY = 'lab_experiments';

export function useLabExperiments() {
  const [experiments, setExperiments] = useState<LabExperiment[]>(() =>
    loadFromStorage(STORAGE_KEY, initialExperiments as LabExperiment[])
  );
  const [loading] = useState(false);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, experiments);
  }, [experiments]);

  const addExperiment = useCallback((exp: Omit<LabExperiment, 'id' | 'createdAt'>) => {
    const newExp: LabExperiment = {
      ...exp,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExperiments(prev => [newExp, ...prev]);
    return newExp;
  }, []);

  const updateExperiment = useCallback((id: string, updates: Partial<LabExperiment>) => {
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteExperiment = useCallback((id: string) => {
    setExperiments(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    experiments,
    loading,
    addExperiment,
    updateExperiment,
    deleteExperiment,
  };
}
