import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { metrics, recentActivity, agents } from '../../data/mockData';
import { formatDistanceToNow } from 'date-fns';

const metricIcons = {
  CheckSquare: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Zap: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Activity: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
};

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(false);

  useEffect(() => {
    if (startRef.current) return;
    startRef.current = true;
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step * 10) / 10, value);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{typeof value === 'number' && value % 1 !== 0 ? display.toFixed(1) : display}{suffix}</span>;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CommandDeck() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <motion.div variants={stagger} initial="hidden" animate={mounted ? 'show' : 'hidden'}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {metrics.map((m, i) => {
          const Icon = metricIcons[m.icon];
          return (
            <motion.div key={i} variants={fadeUp} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#10b981',
                }}>
                  <Icon />
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20,
                  background: m.trend === 'up' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                  color: m.trend === 'up' ? '#10b981' : 'var(--color-text-muted)',
                }}>
                  {m.change}
                </span>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
                  <AnimatedNumber value={m.value} suffix={m.suffix} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, responsive: true }}>
        {/* Activity Feed */}
        <motion.div variants={fadeUp} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            近期活动
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 360, overflowY: 'auto' }}>
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.agent}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-secondary)' }}>{item.action}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDistanceToNow(item.time, { addSuffix: false, locale: { formatDistance: () => '' } })}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Agent Status */}
        <motion.div variants={fadeUp} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            代理状态
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agents.map(agent => {
              const statusColor = { online: '#10b981', idle: '#f59e0b', error: '#ef4444', offline: '#6b7280' }[agent.status];
              return (
                <div key={agent.id} style={{
                  padding: 12, borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{agent.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{agent.name}</span>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', background: statusColor, marginLeft: 'auto',
                      ...(agent.status === 'online' ? { animation: 'pulse-online 2s ease-in-out infinite' } : {}),
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    {agent.currentActivity}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {agent.status === 'online' ? '刚刚' : `最后 ${formatDistanceToNow(agent.lastSeen)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
