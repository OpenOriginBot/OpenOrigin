import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PageHeader } from '../PageHeader';
import styles from './BrainHub.module.css';

interface HubCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  path: string;
}

const hubCards: HubCard[] = [
  {
    id: 'memory',
    icon: '🧠',
    title: '内存查看器',
    description: '查看每日记录、长期记忆和工作日志',
    path: '/brain/memory',
  },
  {
    id: 'briefings',
    icon: '📋',
    title: '晨间简报归档',
    description: '查看每日运营简报和活动摘要',
    path: '/brain/briefings',
  },
  {
    id: 'skills',
    icon: '⚡',
    title: '技能目录',
    description: '浏览所有可用技能和使用说明',
    path: '/brain/skills',
  },
  {
    id: 'cron',
    icon: '⏰',
    title: '定时任务健康',
    description: '监控系统定时任务的执行状态',
    path: '/brain/cron',
  },
];

// Data card types
interface BriefingSummary {
  id: string;
  date: string;
  sent: boolean;
  summary: string;
  title?: string;
}

interface MemoryStats {
  totalFiles: number;
  totalSize: number;
  lastUpdated: string;
  newestFile: string;
}

interface CronStats {
  healthy: number;
  failed: number;
  disabled: number;
}

interface SkillsStats {
  total: number;
  custom: number;
  builtIn: number;
}

export function BrainHub() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [cronStats, setCronStats] = useState<CronStats | null>(null);
  const [skillsStats, setSkillsStats] = useState<SkillsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      fetch('/api/briefs').then(r => r.json()).catch(() => ({ briefs: [] })),
      fetch('/api/memory/stats').then(r => r.json()).catch(() => null),
      fetch('/api/cron-health').then(r => r.json()).catch(() => ({ stats: null })),
      fetch('/api/skills').then(r => r.json()).catch(() => ({ skills: [] })),
    ]).then(([briefsData, memStats, cronData, skillsData]) => {
      // Get latest briefing
      if (briefsData.briefs && briefsData.briefs.length > 0) {
        setBriefing(briefsData.briefs[0]);
      }
      // Set memory stats
      if (memStats) {
        setMemoryStats(memStats);
      }
      // Set cron stats
      if (cronData.stats) {
        setCronStats(cronData.stats);
      }
      // Set skills stats
      if (skillsData.skills) {
        const skills = skillsData.skills;
        const builtIn = skills.filter((s: any) => s.source === 'built-in').length;
        setSkillsStats({
          total: skills.length,
          custom: skills.length - builtIn,
          builtIn,
        });
      }
      setLoading(false);
    });
  }, []);

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.page}>
      <PageHeader
        icon="🧠"
        title="大脑模块"
        description="操作系统的知识中心"
      />

      {/* Data Overview Cards */}
      <div className={styles.dataGrid}>
        {/* Latest Briefing Card */}
        <Link to="/brain/briefings" className={styles.dataCard}>
          <div className={styles.dataCardHeader}>
            <span className={styles.dataCardIcon}>📋</span>
            <span className={styles.dataCardLabel}>最新简报</span>
          </div>
          {loading ? (
            <div className={styles.dataCardContent}>加载中...</div>
          ) : briefing ? (
            <>
              <div className={styles.dataCardDate}>{briefing.date}</div>
              <div className={styles.dataCardStatus}>
                <span className={briefing.sent ? styles.statusSent : styles.statusPending}>
                  {briefing.sent ? '✅ 已发送' : '⏳ 待处理'}
                </span>
              </div>
              <div className={styles.dataCardSummary}>{briefing.summary?.substring(0, 80)}...</div>
            </>
          ) : (
            <div className={styles.dataCardEmpty}>暂无简报</div>
          )}
          <div className={styles.dataCardArrow}>→</div>
        </Link>

        {/* Memory Stats Card */}
        <Link to="/brain/memory" className={styles.dataCard}>
          <div className={styles.dataCardHeader}>
            <span className={styles.dataCardIcon}>💾</span>
            <span className={styles.dataCardLabel}>内存统计</span>
          </div>
          {loading ? (
            <div className={styles.dataCardContent}>加载中...</div>
          ) : memoryStats ? (
            <>
              <div className={styles.dataCardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{memoryStats.totalFiles}</span>
                  <span className={styles.statLabel}>文件</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatBytes(memoryStats.totalSize)}</span>
                  <span className={styles.statLabel}>总大小</span>
                </div>
              </div>
              <div className={styles.dataCardMeta}>
                最新: {memoryStats.newestFile}
              </div>
            </>
          ) : (
            <div className={styles.dataCardEmpty}>暂无数据</div>
          )}
          <div className={styles.dataCardArrow}>→</div>
        </Link>

        {/* Cron Health Card */}
        <Link to="/brain/cron" className={styles.dataCard}>
          <div className={styles.dataCardHeader}>
            <span className={styles.dataCardIcon}>⏰</span>
            <span className={styles.dataCardLabel}>定时任务健康</span>
          </div>
          {loading ? (
            <div className={styles.dataCardContent}>加载中...</div>
          ) : cronStats ? (
            <div className={styles.dataCardStats}>
              <div className={styles.statItem}>
                <span className={`${styles.statValue} ${styles.healthy}`}>{cronStats.healthy}</span>
                <span className={styles.statLabel}>正常</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statValue} ${cronStats.failed > 0 ? styles.failed : ''}`}>
                  {cronStats.failed}
                </span>
                <span className={styles.statLabel}>失败</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{cronStats.disabled}</span>
                <span className={styles.statLabel}>禁用</span>
              </div>
            </div>
          ) : (
            <div className={styles.dataCardEmpty}>暂无数据</div>
          )}
          <div className={styles.dataCardArrow}>→</div>
        </Link>

        {/* Skills Stats Card */}
        <Link to="/brain/skills" className={styles.dataCard}>
          <div className={styles.dataCardHeader}>
            <span className={styles.dataCardIcon}>⚡</span>
            <span className={styles.dataCardLabel}>技能统计</span>
          </div>
          {loading ? (
            <div className={styles.dataCardContent}>加载中...</div>
          ) : skillsStats ? (
            <div className={styles.dataCardStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{skillsStats.total}</span>
                <span className={styles.statLabel}>总计</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{skillsStats.custom}</span>
                <span className={styles.statLabel}>自定义</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{skillsStats.builtIn}</span>
                <span className={styles.statLabel}>内置</span>
              </div>
            </div>
          ) : (
            <div className={styles.dataCardEmpty}>暂无数据</div>
          )}
          <div className={styles.dataCardArrow}>→</div>
        </Link>
      </div>

      {/* Original Navigation Cards */}
      <h3 className={styles.sectionTitle}>快速入口</h3>
      <div className={styles.grid}>
        {hubCards.map(card => (
          <button
            key={card.id}
            className={styles.card}
            onClick={() => navigate(card.path)}
          >
            <div className={styles.cardIcon}>{card.icon}</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDescription}>{card.description}</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}