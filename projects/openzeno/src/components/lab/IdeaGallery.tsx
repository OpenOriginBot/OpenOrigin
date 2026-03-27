import { useState, useEffect, useMemo } from 'react';
import { EmptyState, Loading } from '../common';
import { PageHeader } from '../PageHeader';
import { formatDate } from '../../utils';
import styles from './IdeaGallery.module.css';

export interface Idea {
  id: string;
  title: string;
  summary: string;
  date: string;
  track: 'A' | 'B';
  category: string;
  ratings: {
    painPoint: number;
    devEfficiency: number;
    commercialization: number;
    aiAdvantage: number;
  };
  overallScore: number;
}

type SortMode = 'date' | 'score';
type TrackFilter = 'all' | 'A' | 'B';

const ratingLabels: Record<string, string> = {
  painPoint: '痛点强度',
  devEfficiency: '开发效率',
  commercialization: '商业化潜力',
  aiAdvantage: 'AI 优势'
};

export function IdeaGallery() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('date');

  useEffect(() => {
    fetch('/api/ideas')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setIdeas(data.ideas || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(ideas.map(i => i.category));
    return ['all', ...Array.from(cats)];
  }, [ideas]);

  const filteredAndSorted = useMemo(() => {
    let result = [...ideas];

    // Track filter
    if (trackFilter !== 'all') {
      result = result.filter(i => i.track === trackFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(i => i.category === categoryFilter);
    }

    // Sort
    if (sortMode === 'date') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      result.sort((a, b) => b.overallScore - a.overallScore);
    }

    return result;
  }, [ideas, trackFilter, categoryFilter, sortMode]);

  if (loading) return <Loading text="加载创意列表..." />;

  if (error) {
    return (
      <div className={styles.page}>
        <PageHeader icon="💡" title="创意图库" description="记录所有产品创意和灵感" />
        <EmptyState icon="⚠️" title="加载失败" description={`无法获取创意数据: ${error}`} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader icon="💡" title="创意图库" description="记录所有产品创意和灵感" />

      {ideas.length === 0 ? (
        <EmptyState icon="💡" title="暂无创意" description="创意将在这里展示" />
      ) : (
        <>
          <div className={styles.controls}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>赛道</span>
              {(['all', 'A', 'B'] as const).map(t => (
                <button
                  key={t}
                  className={`${styles.filterBtn} ${trackFilter === t ? styles.active : ''}`}
                  onClick={() => setTrackFilter(t)}
                >
                  {t === 'all' ? '全部' : `赛道${t}`}
                </button>
              ))}
            </div>

            <select
              className={styles.categorySelect}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? '全部分类' : c}</option>
              ))}
            </select>

            <select
              className={styles.sortSelect}
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
            >
              <option value="date">按日期排序</option>
              <option value="score">按综合评分排序</option>
            </select>
          </div>

          <div className={styles.grid}>
            {filteredAndSorted.map(idea => (
              <div key={idea.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{idea.title}</h3>
                  <span className={`${styles.trackBadge} ${styles[idea.track]}`}>
                    赛道{idea.track}
                  </span>
                </div>

                <div className={styles.cardMeta}>
                  <span className={styles.category}>{idea.category}</span>
                  <span className={styles.date}>{formatDate(idea.date)}</span>
                </div>

                <p className={styles.description}>{idea.summary}</p>

                <div className={styles.ratingsGrid}>
                  {(Object.entries(ratingLabels) as [keyof Idea['ratings'], string][]).map(([key, label]) => (
                    <div key={key} className={styles.ratingItem}>
                      <span className={styles.ratingLabel}>{label}</span>
                      <span className={styles.ratingValue}>{idea.ratings[key]}/5</span>
                    </div>
                  ))}
                </div>

                <div className={styles.overallScore}>
                  <span className={styles.scoreLabel}>综合评分</span>
                  <span className={styles.scoreValue}>{idea.overallScore.toFixed(1)}</span>
                </div>
                <div className={styles.scoreBar}>
                  <div
                    className={styles.scoreBarFill}
                    style={{ width: `${(idea.overallScore / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
