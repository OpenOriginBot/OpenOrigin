import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS, EXPERIMENT_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/date';
import { Card, CardBody, CardFooter, Badge, Button, Modal, EmptyState, LoadingSpinner } from '../../components/common';
import labSeed from '../../data/labSeed.json';
import './ExperimentDashboard.css';

const STATUS_TABS = [
  { value: 'all', label: '全部' },
  { value: EXPERIMENT_STATUS.ACTIVE, label: '进行中' },
  { value: EXPERIMENT_STATUS.PAUSED, label: '暂停' },
  { value: EXPERIMENT_STATUS.COMPLETED, label: '已完成' },
  { value: EXPERIMENT_STATUS.ARCHIVED, label: '归档' },
];

export default function ExperimentDashboard() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  useEffect(() => { loadExperiments(); }, []);

  function loadExperiments() {
    try {
      const stored = storage.load(STORAGE_KEYS.LAB_EXPERIMENTS);
      if (stored && stored.experiments && stored.experiments.length > 0) {
        setExperiments(stored.experiments);
      } else {
        setExperiments(labSeed.experiments);
        storage.save(STORAGE_KEYS.LAB_EXPERIMENTS, { experiments: labSeed.experiments });
      }
    } catch (e) {
      setError('加载实验失败：' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function persist(list) {
    setExperiments(list);
    storage.save(STORAGE_KEYS.LAB_EXPERIMENTS, { experiments: list });
  }

  function handleCreate(data) {
    const created = {
      ...data,
      id: Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persist([created, ...experiments]);
    setModalOpen(false);
  }

  function handleUpdate(data) {
    const updated = experiments.map(e =>
      e.id === editingExp.id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
    );
    persist(updated);
    setEditingExp(null);
    setModalOpen(false);
  }

  function handleDelete(id) {
    if (!window.confirm('确认删除此实验？')) return;
    persist(experiments.filter(e => e.id !== id));
  }

  function handleStatusChange(id, newStatus) {
    persist(experiments.map(e =>
      e.id === id ? { ...e, status: newStatus, updatedAt: new Date().toISOString() } : e
    ));
  }

  const filtered = activeTab === 'all'
    ? experiments
    : experiments.filter(e => e.status === activeTab);

  const stats = {
    total: experiments.length,
    active: experiments.filter(e => e.status === EXPERIMENT_STATUS.ACTIVE).length,
    paused: experiments.filter(e => e.status === EXPERIMENT_STATUS.PAUSED).length,
    completed: experiments.filter(e => e.status === EXPERIMENT_STATUS.COMPLETED).length,
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-msg">❌ {error}</div>;

  return (
    <div className="experiment-dashboard">
      <div className="module-header">
        <div>
          <h1 className="module-title">🔬 Lab</h1>
          <p className="module-subtitle">实验与原型总览</p>
        </div>
        <Button onClick={() => { setEditingExp(null); setModalOpen(true); }}>
          + 新建实验
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">总计</span>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-num">{stats.active}</span>
          <span className="stat-label">进行中</span>
        </div>
        <div className="stat-card stat-yellow">
          <span className="stat-num">{stats.paused}</span>
          <span className="stat-label">暂停</span>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-num">{stats.completed}</span>
          <span className="stat-label">已完成</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="status-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            className={`tab-btn ${activeTab === tab.value ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="tab-count">
                {tab.value === EXPERIMENT_STATUS.ACTIVE ? stats.active
                  : tab.value === EXPERIMENT_STATUS.PAUSED ? stats.paused
                  : tab.value === EXPERIMENT_STATUS.COMPLETED ? stats.completed
                  : experiments.filter(e => e.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔬"
          title="暂无实验"
          description="创建一个实验来跟踪您的业务探索"
          action={<Button onClick={() => setModalOpen(true)}>新建实验</Button>}
        />
      ) : (
        <div className="exp-grid">
          {filtered.map(exp => (
            <Card key={exp.id} className={`exp-card exp-${exp.status}`}>
              <CardBody>
                <div className="exp-header">
                  <Badge status={exp.status} />
                  <span className="exp-updated">更新于 {formatDate(exp.updatedAt)}</span>
                </div>
                <h3 className="exp-title">{exp.title}</h3>
                <p className="exp-desc">{exp.description}</p>
                <div className="exp-next">
                  <span className="next-label">▶ 下一步</span>
                  <p className="next-text">{exp.nextAction}</p>
                </div>
              </CardBody>
              <CardFooter>
                <div className="exp-footer-left">
                  <span className="exp-assignee">👤 {exp.assignee}</span>
                </div>
                <div className="exp-footer-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingExp(exp);
                      setModalOpen(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(exp.id)}
                  >
                    删除
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExp(null); }}
        title={editingExp ? '编辑实验' : '新建实验'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>取消</Button>
            <Button
              onClick={e => {
                e.preventDefault();
                const form = document.getElementById('exp-form');
                if (!form.checkValidity()) { form.reportValidity(); return; }
                const fd = new FormData(form);
                const data = Object.fromEntries(fd.entries());
                if (editingExp) { handleUpdate(data); } else { handleCreate(data); }
              }}
            >
              {editingExp ? '保存' : '创建'}
            </Button>
          </>
        }
      >
        <ExpForm experiment={editingExp} />
      </Modal>
    </div>
  );
}

function ExpForm({ experiment }) {
  return (
    <form id="exp-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>实验名称 *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={experiment?.title || ''}
          placeholder="如：防水灯带新品线"
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>描述</label>
        <textarea
          name="description"
          rows="3"
          defaultValue={experiment?.description || ''}
          placeholder="描述实验目标和背景..."
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>下一步动作 *</label>
        <input
          name="nextAction"
          type="text"
          required
          defaultValue={experiment?.nextAction || ''}
          placeholder="下一步要做什么？"
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>状态</label>
          <select
            name="status"
            defaultValue={experiment?.status || EXPERIMENT_STATUS.ACTIVE}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
          >
            {Object.values(EXPERIMENT_STATUS).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>负责人</label>
          <input
            name="assignee"
            type="text"
            defaultValue={experiment?.assignee || '小猿'}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>
      </div>
    </form>
  );
}
