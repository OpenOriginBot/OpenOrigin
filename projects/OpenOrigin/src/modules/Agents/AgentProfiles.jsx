import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAgents } from '../../services/api';

function normalizeAgent(a) {
  return {
    id: a.id,
    emoji: a.emoji || '🤖',
    name: a.name,
    subtitle: a.subtitle || '',
    type: a.type || 'Agent',
    role: a.role || '',
    color: a.color || '#10b981',
    status: a.status,
    currentActivity: a.current_activity || a.currentActivity || '—',
    completedTasks: a.completed_tasks ?? a.completedTasks ?? 0,
    accuracy: a.accuracy ?? 0,
    skills: a.skills || [],
  };
}

const statusLabels = { online: '在线', idle: '闲置', error: '异常', offline: '离线' };
const statusColors = { online: '#10b981', idle: '#f59e0b', error: '#ef4444', offline: '#6b7280' };

export default function AgentProfiles() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchAgents()
      .then(data => setAgents((data || []).map(normalizeAgent)))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>特工档案</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 18,
      }}>
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card"
            style={{ padding: 24, cursor: 'pointer' }}
            onClick={() => setSelected(agent.id === selected ? null : agent.id)}
            whileHover={{ scale: 1.01 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: `${agent.color}18`,
                border: `1px solid ${agent.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
              }}>
                {agent.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{agent.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{agent.subtitle}</div>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                background: `${agent.color}15`, color: agent.color,
                border: `1px solid ${agent.color}25`,
              }}>
                {agent.type}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11,
                background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)',
              }}>
                {agent.role}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11,
                background: `${statusColors[agent.status]}15`, color: statusColors[agent.status],
              }}>
                {statusLabels[agent.status]}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{agent.completedTasks}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>已完成任务</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  {agent.accuracy}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>准确率</div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginBottom: selected === agent.id ? 16 : 0 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>技能</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {agent.skills.map(skill => (
                  <span key={skill} style={{
                    padding: '3px 8px', borderRadius: 6, fontSize: 11,
                    background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Expanded */}
            {selected === agent.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}
              >
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>当前活动</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{agent.currentActivity}</div>
              </motion.div>
            )}

            <button style={{
              width: '100%', marginTop: 16, padding: '8px 0',
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 8, color: '#10b981', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-display)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
            >
              查看详情 →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
