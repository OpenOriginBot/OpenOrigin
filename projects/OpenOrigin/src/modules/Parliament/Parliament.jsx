import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchParliament } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const stanceColors = { in_favor: '#10b981', against: '#ef4444', conditional: '#f59e0b' };
const stanceLabels = { in_favor: '赞成', against: '反对', conditional: '有条件' };
const statusConfig = {
  voting: { label: '投票中', color: '#06b6d4' },
  deliberating: { label: '审议中', color: '#f59e0b' },
  decided: { label: '已决定', color: '#10b981' },
};

function normalizeSession(s) {
  return {
    id: s.id,
    question: s.question,
    status: s.status,
    participants: (s.participants || []).map(p => ({
      agent: p.agent || '🤖',
      name: p.name || 'Agent',
      stance: p.stance,
      status: p.status,
    })),
    messages: (s.messages || []).map((m, mi) => ({
      agent: m.agent || '🤖',
      name: m.name || 'Agent',
      text: m.text || m.message || '',
      time: m.created_at ? new Date(m.created_at) : (m.time ? new Date(m.time) : new Date()),
    })),
  };
}

export default function Parliament() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchParliament()
      .then(data => setSessions((data || []).map(normalizeSession)))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>议会</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sessions.map((session, i) => {
          const isOpen = expanded === session.id;
          const status = statusConfig[session.status];

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card"
              style={{ overflow: 'hidden' }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '16px 20px', cursor: 'pointer',
                  borderLeft: `3px solid ${status.color}`,
                }}
                onClick={() => setExpanded(isOpen ? null : session.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>
                      {session.question}
                    </div>
                    {/* Participants */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      {session.participants.map(p => (
                        <span key={p.name} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 6, fontSize: 11,
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--color-text-secondary)',
                        }}>
                          <span style={{ fontSize: 12 }}>{p.agent}</span>
                          {p.name.split(' ')[0]}
                          <span style={{
                            fontSize: 9, padding: '1px 4px', borderRadius: 4,
                            background: `${stanceColors[p.stance]}20`,
                            color: stanceColors[p.stance],
                          }}>
                            {stanceLabels[p.stance]}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Status */}
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: `${status.color}15`, color: status.color,
                    border: `1px solid ${status.color}25`,
                    whiteSpace: 'nowrap',
                  }}>
                    {status.label}
                  </span>
                </div>

                {/* Expand hint */}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {isOpen ? '点击收起' : '点击展开'} · {session.messages.length} 条消息
                </div>
              </div>

              {/* Expanded messages */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ borderTop: '1px solid var(--color-border)' }}
                  >
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {session.messages.map((msg, mi) => (
                        <motion.div
                          key={mi}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: mi * 0.06 }}
                          style={{ display: 'flex', gap: 10 }}
                        >
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{msg.agent}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{msg.name}</span>
                              <span style={{
                                fontSize: 10, padding: '1px 5px', borderRadius: 4,
                                background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-mono)',
                              }}>
                                #{mi + 1}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                {formatDistanceToNow(msg.time, { addSuffix: true })}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                              {msg.text}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
