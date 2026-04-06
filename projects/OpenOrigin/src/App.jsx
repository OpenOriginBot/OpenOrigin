import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { agents } from './data/mockData';
import CommandDeck from './modules/Dashboard/CommandDeck';
import AgentProfiles from './modules/Agents/AgentProfiles';
import Kanban from './modules/TaskBoard/Kanban';
import AILogs from './modules/Logs/AILogs';
import Parliament from './modules/Parliament/Parliament';
import MeetingIntelligence from './modules/Meetings/MeetingIntelligence';
import MemoryRegistry from './modules/Brain/MemoryRegistry';
import './index.css';

const TABS = [
  { id: 'deck', label: '指挥甲板', icon: 'Grid' },
  { id: 'agents', label: '特工档案', icon: 'Users' },
  { id: 'tasks', label: '任务板', icon: 'CheckSquare' },
  { id: 'logs', label: 'AI日志', icon: 'ScrollText' },
  { id: 'parliament', label: '议会', icon: 'Building2' },
  { id: 'meetings', label: '会议情报', icon: 'Calendar' },
  { id: 'memory', label: '记忆', icon: 'Brain' },
];

const tabIcons = {
  Grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  CheckSquare: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  ScrollText: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Building2: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Brain: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
};

const statusColors = { online: '#10b981', idle: '#f59e0b', error: '#ef4444', offline: '#6b7280' };
const onlineAgents = agents.filter(a => a.status !== 'offline');

function App() {
  const [activeTab, setActiveTab] = useState('deck');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'deck': return <CommandDeck />;
      case 'agents': return <AgentProfiles />;
      case 'tasks': return <Kanban />;
      case 'logs': return <AILogs />;
      case 'parliament': return <Parliament />;
      case 'meetings': return <MeetingIntelligence />;
      case 'memory': return <MemoryRegistry />;
      default: return <CommandDeck />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🐾</span>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>OpenOrigin</span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            marginLeft: 8,
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onlineAgents.map(agent => (
            <div key={agent.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px',
              background: 'var(--color-surface)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border)',
              borderLeft: `2px solid ${agent.color}`,
              borderRadius: 8,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: statusColors[agent.status],
                ...(agent.status === 'online' ? { animation: 'pulse-online 2s ease-in-out infinite' } : {}),
              }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{agent.emoji} {agent.name.split(' ')[0]}</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {agent.status === 'online' ? '在线' : agent.status === 'idle' ? '闲置' : '异常'}
              </span>
            </div>
          ))}
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            最后出现：刚才
          </span>
          <button style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav style={{
        display: 'flex', gap: 4, padding: '12px 24px 0',
        borderBottom: '1px solid var(--color-border)',
        overflowX: 'auto',
      }}>
        {TABS.map((tab, i) => {
          const Icon = tabIcons[tab.icon];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                background: isActive ? 'var(--color-surface)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-emerald)' : '2px solid transparent',
                color: isActive ? 'var(--color-emerald)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                borderRadius: '8px 8px 0 0',
              }}
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
