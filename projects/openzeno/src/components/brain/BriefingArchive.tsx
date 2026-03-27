import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '../PageHeader';
import { EmptyState, Loading } from '../common';
import styles from './BriefingArchive.module.css';

interface Briefing {
  id: string;
  date: string;
  sent: boolean;
  summary: string;
  content: string;
}

export function BriefingArchive() {
  const [briefs, setBriefs] = useState<Briefing[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBriefs();
  }, []);

  const loadBriefs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/briefs');
      if (!res.ok) throw new Error('Failed to load briefings');
      const data = await res.json();
      setBriefs(data.briefs || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (dateStr: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  if (loading) {
    return <Loading text="加载简报中..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="❌"
        title="加载失败"
        description={error}
      />
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        icon="📋"
        title="晨间简报归档"
        description="每日运营简报和活动摘要"
      />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/brain">大脑</Link>
        <span> / </span>
        <span>晨间简报归档</span>
      </div>

      {briefs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="暂无简报"
          description="每日简报会在这里显示。运营动态、异常提醒、本日待办都将汇总于此。"
        />
      ) : (
        <div className={styles.list}>
          {briefs.map(brief => (
            <article key={brief.id} className={styles.card}>
              <button
                className={styles.cardHeader}
                onClick={() => setExpandedId(expandedId === brief.id ? null : brief.id)}
              >
                <div className={styles.cardMeta}>
                  <span className={`${styles.status} ${isToday(brief.date) ? styles.sent : styles.pending}`}>
                    {isToday(brief.date) ? '已发送' : '已归档'}
                  </span>
                  <span className={styles.date}>{formatDate(brief.date)}</span>
                </div>
                <div className={styles.summary}>{brief.summary}</div>
                <div className={styles.expandIcon}>
                  {expandedId === brief.id ? '−' : '+'}
                </div>
              </button>

              {expandedId === brief.id && (
                <div className={styles.cardContent}>
                  <ReactMarkdown>{brief.content}</ReactMarkdown>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}