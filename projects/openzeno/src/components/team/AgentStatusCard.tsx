import { AgentStatus } from '../../types';
import styles from './AgentStatusCard.module.css';

interface AgentStatusCardProps {
  agent: AgentStatus;
  onClick?: () => void;
}

export function AgentStatusCard({ agent, onClick }: AgentStatusCardProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))

      if (diffMins < 1) return '刚刚'
      if (diffMins < 60) return `${diffMins} 分钟前`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours} 小时前`
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    } catch {
      return '未知'
    }
  }

  return (
    <div className={styles.card} onClick={onClick} style={{ '--dept-color': agent.color } as React.CSSProperties}>
      <div className={styles.header}>
        <span className={styles.emoji}>{agent.emoji}</span>
        <div className={`${styles.statusDot} ${agent.status === 'online' ? styles.online : styles.offline}`} />
      </div>

      <div className={styles.name}>{agent.name}</div>
      <div className={styles.department}>{agent.department}</div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>状态</span>
          <span className={`${styles.metaValue} ${agent.status === 'online' ? styles.onlineText : styles.offlineText}`}>
            {agent.status === 'online' ? '在线' : '离线'}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>心跳</span>
          <span className={styles.metaValue}>{formatTime(agent.lastHeartbeat)}</span>
        </div>
      </div>

      <div className={styles.model}>
        <span className={styles.metaLabel}>模型</span>
        <span className={styles.modelBadge}>{agent.model}</span>
      </div>

      {agent.completionRate !== null && (
        <div className={styles.completionBar}>
          <div className={styles.completionLabel}>
            <span className={styles.metaLabel}>任务完成率</span>
            <span className={styles.completionValue}>{agent.completionRate}%</span>
          </div>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ width: `${agent.completionRate}%` }}
            />
          </div>
        </div>
      )}

      {agent.recentActivity && (
        <div className={styles.activity}>
          <span className={styles.metaLabel}>最近活动</span>
          <span className={styles.activityText}>{agent.recentActivity}</span>
        </div>
      )}

      {onClick && <div className={styles.viewDetail}>点击查看详情 →</div>}
    </div>
  )
}
