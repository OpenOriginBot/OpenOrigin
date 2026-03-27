import { Link } from 'react-router-dom';
import styles from './DashboardCard.module.css';

interface DashboardCardProps {
  icon: string;
  title: string;
  mainStat: string | number;
  subStat?: string;
  label?: string;
  latestItem?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  accentColor?: string;
  onClick?: () => void;
}

export function DashboardCard({
  icon,
  title,
  mainStat,
  subStat,
  label,
  latestItem,
  viewAllTo,
  viewAllLabel = '查看全部',
  accentColor = '#8b5cf6',
  onClick
}: DashboardCardProps) {
  return (
    <div
      className={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ background: `${accentColor}15` }}>
          <span>{icon}</span>
        </div>
        <span className={styles.title} style={{ color: accentColor }}>{title}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.mainStat}>{mainStat}</div>
        {subStat && <div className={styles.subStat}>{subStat}</div>}
        {label && <div className={styles.label}>{label}</div>}
        {latestItem && (
          <div className={styles.latestItem} title={latestItem}>
            📌 {latestItem}
          </div>
        )}
      </div>

      {viewAllTo && (
        <div className={styles.footer}>
          <Link to={viewAllTo} className={styles.viewLink} onClick={e => e.stopPropagation()}>
            → {viewAllLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
