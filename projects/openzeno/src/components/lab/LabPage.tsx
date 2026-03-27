import { useState, useMemo } from 'react';
import { useLabExperiments } from '../../hooks/useLabExperiments';
import { LabExperiment } from '../../types';
import { ExperimentCard } from './ExperimentCard';
import { ExperimentForm } from './ExperimentForm';
import { EmptyState, Loading } from '../common';
import { experimentStatusColors } from '../../utils';
import styles from './LabPage.module.css';

type FilterStatus = LabExperiment['status'] | 'all';

export function LabPage() {
  const { experiments, loading, addExperiment, updateExperiment, deleteExperiment } = useLabExperiments();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState<LabExperiment | null>(null);

  const filteredExperiments = useMemo(() => {
    if (statusFilter === 'all') return experiments;
    return experiments.filter(e => e.status === statusFilter);
  }, [experiments, statusFilter]);

  const groupedByStatus = useMemo(() => {
    const groups: Record<string, LabExperiment[]> = {
      active: [],
      paused: [],
      completed: [],
      archived: [],
    };
    filteredExperiments.forEach(exp => {
      groups[exp.status].push(exp);
    });
    return groups;
  }, [filteredExperiments]);

  const statusLabels: Record<string, string> = {
    active: '进行中',
    paused: '已暂停',
    completed: '已完成',
    archived: '已归档',
  };

  const handleSubmit = (expData: Omit<LabExperiment, 'id' | 'createdAt'>) => {
    if (editingExp) {
      updateExperiment(editingExp.id, expData);
    } else {
      addExperiment(expData);
    }
    setShowForm(false);
    setEditingExp(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个实验吗？')) {
      deleteExperiment(id);
    }
  };

  const handleStatusChange = (id: string, status: LabExperiment['status']) => {
    updateExperiment(id, { status });
  };

  if (loading) {
    return <Loading text="加载实验中..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>实验室</h1>
          <p className={styles.subtitle}>实验与原型追踪</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + 新建实验
        </button>
      </div>

      <div className={styles.filters}>
        <label>筛选</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as FilterStatus)}>
          <option value="all">全部状态</option>
          <option value="active">进行中</option>
          <option value="paused">已暂停</option>
          <option value="completed">已完成</option>
          <option value="archived">已归档</option>
        </select>
      </div>

      {experiments.length === 0 ? (
        <EmptyState
          icon="🧪"
          title="暂无实验"
          description="点击「新建实验」开始追踪你的第一个运营实验"
          action={{ label: '新建实验', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className={styles.board}>
          {(['active', 'paused', 'completed', 'archived'] as const).map(status => {
            const exps = groupedByStatus[status];
            if (statusFilter !== 'all' && statusFilter !== status) return null;
            return (
              <div key={status} className={styles.column}>
                <div className={styles.columnHeader}>
                  <span 
                    className={styles.columnDot}
                    style={{ backgroundColor: experimentStatusColors[status] }}
                  />
                  <span className={styles.columnTitle}>{statusLabels[status]}</span>
                  <span className={styles.columnCount}>{exps.length}</span>
                </div>
                <div className={styles.columnContent}>
                  {exps.map(exp => (
                    <ExperimentCard
                      key={exp.id}
                      experiment={exp}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ExperimentForm
          experiment={editingExp}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingExp(null);
          }}
        />
      )}
    </div>
  );
}
