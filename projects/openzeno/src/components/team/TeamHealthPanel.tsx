import { useState, useEffect } from 'react';
import { AgentStatus, TeamStatusResponse } from '../../types';
import { AgentStatusCard } from './AgentStatusCard';
import styles from './TeamHealthPanel.module.css';

interface TeamHealthPanelProps {
  onAgentClick?: (agent: AgentStatus) => void;
}

export function TeamHealthPanel({ onAgentClick }: TeamHealthPanelProps) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [stats, setStats] = useState<{ online: number; offline: number }>({ online: 0, offline: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/team/status');
        const data: TeamStatusResponse = await res.json();
        setAgents(data.agents);
        setStats(data.stats);
      } catch (e) {
        console.error('Failed to fetch team status:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>🏥 团队健康</span>
          <span className={styles.loading}>加载中...</span>
        </div>
        <div className={styles.cardsGrid}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>🏥 团队健康</span>
        <div className={styles.statsBar}>
          <span className={styles.statItem}>
            <span className={styles.dotOnline} />{stats.online} 在线
          </span>
          <span className={styles.statItem}>
            <span className={styles.dotOffline} />{stats.offline} 离线
          </span>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {agents.map(agent => (
          <AgentStatusCard
            key={agent.id}
            agent={agent}
            onClick={onAgentClick ? () => onAgentClick(agent) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
