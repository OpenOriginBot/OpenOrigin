import { useEffect, useState } from 'react';
import { Briefing } from '../../types';
import { BriefingCard } from './BriefingCard';
import { EmptyState, Loading } from '../common';
import styles from './BrainPage.module.css';

export function BrainPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBriefings();
  }, []);

  const loadBriefings = async () => {
    try {
      // In production, this would be an API call
      // For now, we load from static markdown files in public/briefings
      // Since we can't list files, we'll try to load known files
      const dates = ['2026-03-27', '2026-03-26'];
      const loaded: Briefing[] = [];

      for (const date of dates) {
        try {
          const res = await fetch(`/briefings/${date}.md`);
          if (res.ok) {
            const content = await res.text();
            loaded.push({
              id: date,
              filename: `${date}.md`,
              title: extractTitle(content, date),
              date: `${date}T12:00:00`,
              content,
            });
          }
        } catch {
          // File not found, skip
        }
      }

      setBriefings(loaded.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e) {
      console.error('Failed to load briefings:', e);
    } finally {
      setLoading(false);
    }
  };

  const extractTitle = (content: string, fallback: string): string => {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : fallback;
  };

  if (loading) {
    return <Loading text="加载简报中..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>每日简报</h1>
        <p className={styles.subtitle}>运营动态一目了然</p>
      </div>

      {briefings.length === 0 ? (
        <EmptyState
          icon="🧠"
          title="暂无简报"
          description="每日简报会在这里显示。运营动态、异常提醒、本日待办都将汇总于此。"
        />
      ) : (
        <div className={styles.list}>
          {briefings.map(briefing => (
            <BriefingCard key={briefing.id} briefing={briefing} />
          ))}
        </div>
      )}
    </div>
  );
}
