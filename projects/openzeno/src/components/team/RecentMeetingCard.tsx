import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MeetingSummary, MeetingSummaryResponse } from '../../types';
import styles from './RecentMeetingCard.module.css';

export function RecentMeetingCard() {
  const [meeting, setMeeting] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/team/meeting-summary');
        const data: MeetingSummaryResponse = await res.json();
        setMeeting(data.meeting);
      } catch (e) {
        console.error('Failed to fetch meeting summary:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>📅</span>
          <span className={styles.label}>最近晨会</span>
        </div>
        <div className={styles.empty}>暂无晨会记录</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>📅</span>
        <span className={styles.label}>最近晨会</span>
        <span className={styles.round}>第 {meeting.round} 次</span>
      </div>

      <div className={styles.date}>{meeting.date}</div>

      {meeting.attendance && (
        <div className={styles.attendance}>
          <div className={styles.attendee}>
            <span className={styles.attendeeIcon}>⏱️</span>
            <span className={`${styles.attendeeStatus} ${styles[meeting.attendance.ops.replace(/\\+$/, '').trim().toLowerCase()] || ''}`}>
              {meeting.attendance.ops.replace(/\\+$/, '').trim()}
            </span>
          </div>
          <div className={styles.attendee}>
            <span className={styles.attendeeIcon}>✨</span>
            <span className={`${styles.attendeeStatus} ${styles[meeting.attendance.mkt.replace(/\\+$/, '').trim().toLowerCase()] || ''}`}>
              {meeting.attendance.mkt.replace(/\\+$/, '').trim()}
            </span>
          </div>
          <div className={styles.attendee}>
            <span className={styles.attendeeIcon}>💰</span>
            <span className={`${styles.attendeeStatus} ${styles[meeting.attendance.rev.replace(/\\+$/, '').trim().toLowerCase()] || ''}`}>
              {meeting.attendance.rev.replace(/\\+$/, '').trim()}
            </span>
          </div>
        </div>
      )}

      {meeting.decisions.length > 0 && (
        <div className={styles.decisions}>
          <span className={styles.decisionsLabel}>核心决策</span>
          {meeting.decisions.slice(0, 3).map((d, i) => (
            <div key={i} className={styles.decisionItem}>
              <span className={styles.decisionBullet}>•</span>
              <span className={styles.decisionText}>{d}</span>
            </div>
          ))}
          {meeting.totalDecisions > 3 && (
            <div className={styles.moreDecisions}>+{meeting.totalDecisions - 3} 项决策</div>
          )}
        </div>
      )}

      <Link to="/meetings" className={styles.detailLink}>
        查看完整纪要 →
      </Link>
    </div>
  );
}
