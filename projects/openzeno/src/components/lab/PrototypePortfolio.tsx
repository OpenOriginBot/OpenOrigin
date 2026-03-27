import { useState, useEffect, useMemo } from 'react';
import { EmptyState, Loading } from '../common';
import { PageHeader } from '../PageHeader';
import { formatDate } from '../../utils';
import styles from './PrototypePortfolio.module.css';

export interface Prototype {
  id: string;
  name: string;
  description: string;
  port: number;
  status: 'running' | 'stopped' | 'archived';
  rating: number;
  createdAt: string;
  updatedAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.rating}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? styles.star : styles.starEmpty}>★</span>
      ))}
    </div>
  );
}

function isNewlyCreated(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 24;
}

export function PrototypePortfolio() {
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/prototypes')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setPrototypes(data.prototypes || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const sortedPrototypes = useMemo(() => {
    return [...prototypes].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [prototypes]);

  const stats = useMemo(() => ({
    running: prototypes.filter(p => p.status === 'running').length,
    stopped: prototypes.filter(p => p.status === 'stopped').length,
    archived: prototypes.filter(p => p.status === 'archived').length,
    total: prototypes.length
  }), [prototypes]);

  if (loading) return <Loading text="加载原型列表..." />;

  if (error) {
    return (
      <div className={styles.page}>
        <PageHeader icon="⚡" title="原型作品集" description="所有实验性原型项目" />
        <EmptyState icon="⚠️" title="加载失败" description={`无法获取原型数据: ${error}`} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader icon="⚡" title="原型作品集" description="所有实验性原型项目" />

      {prototypes.length === 0 ? (
        <EmptyState
          icon="⚡"
          title="暂无原型"
          description="原型项目将在这里展示"
        />
      ) : (
        <>
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={`${styles.statDot} ${styles.running}`} />
              <span className={styles.statCount}>{stats.running}</span>
              <span>running</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statDot} ${styles.stopped}`} />
              <span className={styles.statCount}>{stats.stopped}</span>
              <span>stopped</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statDot} ${styles.archived}`} />
              <span className={styles.statCount}>{stats.archived}</span>
              <span>archived</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statTotal}>/ {stats.total} total</span>
            </div>
          </div>

          <div className={styles.grid}>
            {sortedPrototypes.map(proto => (
              <div key={proto.id} className={`${styles.card} ${styles[proto.status]}`}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{proto.name}</h3>
                  {isNewlyCreated(proto.createdAt) && (
                    <span className={styles.newBadge}>新增</span>
                  )}
                </div>

                <div className={styles.statusIndicator}>
                  <span className={`${styles.indicatorDot} ${styles[proto.status]}`} />
                  <span className={`${styles.statusText} ${styles[proto.status]}`}>
                    {proto.status}
                  </span>
                </div>

                <p className={styles.description}>{proto.description}</p>

                <div className={styles.cardMeta}>
                  <span className={styles.portInfo}>:{proto.port}</span>
                  <StarRating rating={proto.rating} />
                  <span>更新于 {formatDate(proto.updatedAt)}</span>
                </div>

                {proto.status === 'running' ? (
                  <div className={styles.cardActions}>
                    <a
                      href={`http://localhost:${proto.port}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.openBtn}
                    >
                      🚀 打开
                    </a>
                  </div>
                ) : (
                  <div className={styles.stoppedActions}>
                    <button className={styles.actionBtn}>▶ 启动</button>
                    <button className={styles.actionBtn}>📋 详情</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
