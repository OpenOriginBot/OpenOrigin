import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from './DashboardCard';
import { EmptyState, Loading } from '../common';
import { PageHeader } from '../PageHeader';
import styles from './LabPage.module.css';

interface DashboardData {
  ideas: {
    total: number;
    thisWeek: number;
    latestTitle: string | null;
  };
  prototypes: {
    running: number;
    total: number;
    latestRunningName: string | null;
  };
  builds: {
    latestStatus: 'success' | 'failed';
    latestBuild: {
      id: string;
      timestamp: string;
      message: string;
      status: string;
    };
  };
  research: {
    latestDate: string | null;
    conclusionCount: number;
    totalProjects: number;
  };
}

export function LabPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/lab/dashboard')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="加载实验室数据..." />;

  if (error || !data) {
    return (
      <div className={styles.page}>
        <PageHeader icon="🧪" title="实验室" description="创意、原型与研究指挥中心" />
        <EmptyState icon="⚠️" title="加载失败" description={error || '无法获取数据'} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader icon="🧪" title="实验室" description="创意、原型与研究指挥中心" />

      <div className={styles.dashboard}>
        <DashboardCard
          icon="💡"
          title="创意"
          mainStat={data.ideas.total}
          subStat={`+${data.ideas.thisWeek} 本周新增`}
          latestItem={data.ideas.latestTitle || undefined}
          viewAllTo="/lab/ideas"
          viewAllLabel="创意图库"
          accentColor="#8b5cf6"
        />

        <DashboardCard
          icon="⚡"
          title="原型"
          mainStat={data.prototypes.running}
          subStat={`/ ${data.prototypes.total} total`}
          latestItem={data.prototypes.latestRunningName || undefined}
          viewAllTo="/lab/prototypes"
          viewAllLabel="原型作品集"
          accentColor="#8b5cf6"
        />

        <DashboardCard
          icon="🌙"
          title="夜间构建"
          mainStat={data.builds.latestStatus === 'success' ? '✓' : '✗'}
          subStat={data.builds.latestStatus === 'success' ? '构建成功' : '构建失败'}
          latestItem={data.builds.latestBuild.message}
          accentColor={data.builds.latestStatus === 'success' ? '#22c55e' : '#ef4444'}
        />

        <DashboardCard
          icon="📚"
          title="研究"
          mainStat={data.research.totalProjects}
          subStat={`${data.research.conclusionCount} 条结论`}
          latestItem={data.research.latestDate ? `最新: ${data.research.latestDate}` : undefined}
          viewAllTo="/lab/research"
          viewAllLabel="研究仪表盘"
          accentColor="#8b5cf6"
        />
      </div>

      <div className={styles.quickLinks}>
        <button className={styles.quickLink} onClick={() => navigate('/lab/prototypes')}>
          ⚡ 原型作品集
        </button>
        <button className={styles.quickLink} onClick={() => navigate('/lab/ideas')}>
          💡 创意图库
        </button>
        <button className={styles.quickLink} onClick={() => navigate('/lab/research')}>
          📚 研究仪表盘
        </button>
      </div>
    </div>
  );
}
