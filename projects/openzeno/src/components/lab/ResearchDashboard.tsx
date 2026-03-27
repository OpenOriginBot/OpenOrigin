import { useState, useEffect } from 'react';
import { EmptyState, Loading } from '../common';
import { PageHeader } from '../PageHeader';
import { formatDate } from '../../utils';
import styles from './ResearchDashboard.module.css';

interface ResearchItem {
  id: string;
  type: 'industry' | 'competitor' | 'content';
  title: string;
  date: string;
  summary: string;
  findings?: { id: string; title: string; description: string }[];
  conclusions: string[];
  source: string;
}

interface ResearchResponse {
  items: ResearchItem[];
  totalCount: number;
  totalConclusions: number;
  latestDate: string | null;
}

const typeLabels: Record<string, string> = {
  industry: '行业',
  competitor: '竞品',
  content: '内容'
};

const typeIcons: Record<string, string> = {
  industry: '📊',
  competitor: '🔍',
  content: '✍️'
};

export function ResearchDashboard() {
  const [data, setData] = useState<ResearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/research/latest')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(e => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="加载研究数据..." />;

  if (error) {
    return (
      <div className={styles.page}>
        <PageHeader icon="📚" title="研究仪表盘" description="行业动态与竞品调研" />
        <EmptyState icon="⚠️" title="加载失败" description={`无法获取研究数据: ${error}`} />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader icon="📚" title="研究仪表盘" description="行业动态与竞品调研" />
        <EmptyState icon="📚" title="暂无研究数据" description="研究内容将在这里展示" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader icon="📚" title="研究仪表盘" description="行业动态与竞品调研" />

      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{data.totalCount}</span>
          <span className={styles.summaryLabel}>研究项目</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{data.totalConclusions}</span>
          <span className={styles.summaryLabel}>核心结论</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{data.latestDate ? formatDate(data.latestDate) : '-'}</span>
          <span className={styles.summaryLabel}>最新调研</span>
        </div>
      </div>

      <div className={styles.timeline}>
        {data.items.map(item => (
          <div key={item.id} className={styles.timelineItem}>
            <div className={styles.timelineDate}>
              {formatDate(item.date)}
              <span className={`${styles.typeBadge} ${styles[item.type]}`}>
                {typeIcons[item.type]} {typeLabels[item.type]}
              </span>
            </div>

            <div className={styles.timelineCard}>
              <h3 className={styles.timelineTitle}>{item.title}</h3>
              <p className={styles.timelineSummary}>{item.summary}</p>

              {item.findings && item.findings.length > 0 && (
                <div className={styles.findingsList}>
                  {item.findings.map(finding => (
                    <div key={finding.id} className={styles.findingItem}>
                      <span className={styles.findingIcon}>💡</span>
                      <div>
                        <strong>{finding.title}</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{finding.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {item.conclusions && item.conclusions.length > 0 && (
                <div className={styles.conclusionsSection}>
                  <h4 className={styles.conclusionsTitle}>核心结论</h4>
                  {item.conclusions.map((c, i) => (
                    <p key={i} className={styles.conclusionItem}>{c}</p>
                  ))}
                </div>
              )}

              <p className={styles.source}>📌 来源: {item.source}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
