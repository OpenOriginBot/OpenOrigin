import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import DOMPurify from 'dompurify';
import { meetings, meetingStats, meetingTypeDistribution, monthlyTrend } from '../../data/mockData';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';

const typeConfig = {
  standup: { label: '站立会议', color: '#818cf8' },
  sales: { label: '销售电话', color: '#34d399' },
  '1on1': { label: '一对一', color: '#60a5fa' },
  external: { label: '外部会议', color: '#a78bfa' },
  planning: { label: '策划会议', color: '#2dd4bf' },
  'all-hands': { label: '全体会议', color: '#fb923c' },
  team: { label: '团队会议', color: '#fb923c' },
};

const typeColors = meetingTypeDistribution.reduce((acc, t) => {
  acc[t.name.toLowerCase().replace('-', '')] = t.color;
  return acc;
}, {});

function durationDisplay(mins) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function KPICard({ icon, label, value, sub }) {
  return (
    <div className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: 'rgba(16,185,129,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#10b981', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function MeetingCard({ meeting, onClick }) {
  const cfg = typeConfig[meeting.meeting_type] || { label: meeting.meeting_type, color: '#6b7280' };
  const participantLetters = meeting.participants.map(n => n[0]).slice(0, 3);
  const overflow = meeting.participants.length - 3;

  return (
    <motion.div
      className="glass-card"
      style={{ padding: 16, cursor: 'pointer' }}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <span style={{
          padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
          background: `${cfg.color}18`, color: cfg.color, whiteSpace: 'nowrap',
        }}>
          {cfg.label}
        </span>
        {meeting.has_external_participants && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 2 }}>
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            外部
          </span>
        )}
      </div>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, lineHeight: 1.3 }}>
        {meeting.title}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {formatDistanceToNow(meeting.date, { addSuffix: true })}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {durationDisplay(meeting.duration_minutes)}
        </span>

        {/* Participants */}
        <div style={{ display: 'flex', marginLeft: 'auto' }}>
          {participantLetters.map((l, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: '50%',
              background: `hsl(${(l.charCodeAt(0) * 15) % 360}, 50%, 40%)`,
              border: '2px solid var(--color-bg)',
              marginLeft: i === 0 ? 0 : -6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff',
            }}>
              {l}
            </div>
          ))}
          {overflow > 0 && (
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid var(--color-bg)',
              marginLeft: -6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: 'var(--color-text-muted)',
            }}>
              +{overflow}
            </div>
          )}
        </div>
      </div>

      {/* Action items count */}
      {meeting.action_items?.length > 0 && (
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 8,
        }}>
          <span style={{
            padding: '2px 7px', borderRadius: 8, fontSize: 10,
            background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
          }}>
            {meeting.action_items.filter(a => !a.done).length} 待办
          </span>
          <span style={{
            padding: '2px 7px', borderRadius: 8, fontSize: 10,
            background: 'rgba(16,185,129,0.12)', color: '#10b981',
          }}>
            {meeting.action_items.filter(a => a.done).length} 已完成
          </span>
        </div>
      )}
    </motion.div>
  );
}

function MeetingDetail({ meeting, onClose }) {
  const cfg = typeConfig[meeting.meeting_type] || { label: meeting.meeting_type, color: '#6b7280' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="glass-card"
      style={{ padding: 24, marginTop: 16 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{
              padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
              background: `${cfg.color}18`, color: cfg.color,
            }}>
              {cfg.label}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 10, fontSize: 11,
              background: meeting.sentiment === 'positive' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
              color: meeting.sentiment === 'positive' ? '#10b981' : '#f59e0b',
            }}>
              {meeting.sentiment === 'positive' ? '😊 积极' : '😐 中性'}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{meeting.title}</h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
            padding: 6, cursor: 'pointer', color: 'var(--color-text-muted)',
          }}
        >
          ✕
        </button>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>📅</span> {format(meeting.date, 'yyyy年MM月dd日 HH:mm')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>⏱</span> {durationDisplay(meeting.duration_minutes)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>👥</span> {meeting.participants.join(', ')}
        </div>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>摘要</div>
        <div
          style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(meeting.summary) }}
        />
      </div>

      {/* AI Insight */}
      <div style={{
        padding: '10px 14px', borderRadius: 8, marginBottom: 16,
        background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>✨</span>
        <span style={{ fontSize: 12, color: '#06b6d4' }}>{meeting.ai_insights}</span>
      </div>

      {/* Action Items */}
      {meeting.action_items?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>行动项</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {meeting.action_items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `2px solid ${item.done ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                  background: item.done ? '#10b981' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: '#fff',
                  flexShrink: 0,
                }}>
                  {item.done && '✓'}
                </div>
                <span style={{
                  fontSize: 13, flex: 1,
                  textDecoration: item.done ? 'line-through' : 'none',
                  color: item.done ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                }}>
                  {item.task}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.assignee}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External domains */}
      {meeting.has_external_participants && meeting.external_domains?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>外部参与者</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {meeting.external_domains.map(d => (
              <span key={d} style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 11,
                background: 'rgba(167,139,250,0.1)', color: '#a78bfa',
              }}>
                🌐 {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
          background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)',
          fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-display)',
        }}>
          打开录制
        </button>
        <button style={{
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
          background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)',
          fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-display)',
        }}>
          分享链接
        </button>
      </div>
    </motion.div>
  );
}

export default function MeetingIntelligence() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = meetings.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || m.meeting_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>会议情报</h2>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KPICard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} label="总会议" value={meetingStats.total} />
        <KPICard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} label="本周" value={meetingStats.thisWeek} />
        <KPICard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} label="待处理行动项" value={meetingStats.openActions} />
        <KPICard icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} label="平均时长" value={`${meetingStats.avgDuration}m`} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Pie */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>会议类型分布</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={meetingTypeDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={58}>
                  {meetingTypeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {meetingTypeDistribution.map(t => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flex: 1 }}>{t.name}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>月度趋势</h4>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyTrend} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: 200,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索会议..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--color-text-primary)', fontSize: 13,
              fontFamily: 'var(--font-display)', width: '100%',
            }}
          />
        </div>

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'standup', 'sales', '1on1', 'external', 'planning', 'team'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'var(--font-display)',
                background: typeFilter === t
                  ? (typeConfig[t]?.color ? `${typeConfig[t].color}22` : 'rgba(16,185,129,0.15)')
                  : 'rgba(255,255,255,0.06)',
                color: typeFilter === t
                  ? (typeConfig[t]?.color || '#10b981')
                  : 'var(--color-text-muted)',
                fontWeight: typeFilter === t ? 600 : 400,
              }}
            >
              {t === 'all' ? '全部类型' : (typeConfig[t]?.label || t)}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filtered.map(m => (
          <MeetingCard key={m.id} meeting={m} onClick={() => setSelected(selected === m.id ? null : m.id)} />
        ))}
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {selected && (
          <MeetingDetail
            meeting={meetings.find(m => m.id === selected)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
