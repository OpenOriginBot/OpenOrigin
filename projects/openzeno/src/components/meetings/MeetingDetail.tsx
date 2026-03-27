import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import styles from './MeetingDetail.module.css';

interface MeetingDetailProps {
  getMeetingContent: (date: string) => Promise<string>;
}

export function MeetingDetail({ getMeetingContent }: MeetingDetailProps) {
  const { date } = useParams<{ date: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;

    setLoading(true);
    setError(null);

    getMeetingContent(date)
      .then(setContent)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [date, getMeetingContent]);

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
        <Link to="/meetings" className={styles.back}>← 返回列表</Link>
        <div className={styles.error}>错误: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/meetings" className={styles.back}>← 返回列表</Link>
      <div className={styles.content}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
