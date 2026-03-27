import { Link } from 'react-router-dom';
import { Meeting } from '../../hooks/useMeetings';
import styles from './MeetingList.module.css';

interface MeetingListProps {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
}

export function MeetingList({ meetings, loading, error }: MeetingListProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>错误: {error}</div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h3>暂无会议记录</h3>
          <p>高管晨会将在工作日上午 8:30 自动召开</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📋 高管晨会历史</h2>
      <div className={styles.list}>
        {meetings.map((meeting) => (
          <Link
            key={meeting.id}
            to={`/meetings/${meeting.date}`}
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <span className={styles.date}>{meeting.date}</span>
              {meeting.duration && (
                <span className={styles.duration}>{meeting.duration}分钟</span>
              )}
            </div>
            <h3 className={styles.cardTitle}>{meeting.title}</h3>
            {meeting.attendance && (
              <div className={styles.attendance}>
                <span className={meeting.attendance.ops.includes('✅') ? styles.present : styles.absent}>
                  ⏱️ 运营 {meeting.attendance.ops.includes('✅') ? '✓' : '✗'}
                </span>
                <span className={meeting.attendance.mkt.includes('✅') ? styles.present : styles.absent}>
                  ✨ 营销 {meeting.attendance.mkt.includes('✅') ? '✓' : '✗'}
                </span>
                <span className={meeting.attendance.rev.includes('✅') ? styles.present : styles.absent}>
                  💰 营收 {meeting.attendance.rev.includes('✅') ? '✓' : '✗'}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
