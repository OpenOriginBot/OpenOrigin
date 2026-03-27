import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Briefing } from '../../types';
import { formatDateTime } from '../../utils';
import styles from './BriefingCard.module.css';

interface BriefingCardProps {
  briefing: Briefing;
}

export function BriefingCard({ briefing }: BriefingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{briefing.title}</h3>
          <span className={styles.expandIcon}>{expanded ? '−' : '+'}</span>
        </div>
        <span className={styles.date}>{formatDateTime(briefing.date)}</span>
      </div>
      
      {expanded && (
        <div className={styles.content}>
          <ReactMarkdown>{briefing.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
