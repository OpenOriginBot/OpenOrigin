import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../PageHeader';
import { EmptyState, Loading } from '../common';
import styles from './SkillsDirectory.module.css';

interface Skill {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  status: string;
  description: string;
  source: 'built-in' | 'custom';
  tags?: string[];
  owner?: string;
  version?: string;
  updatedAt?: string;
  referencedBy?: string[];
}

type FilterType = 'all' | 'built-in' | 'custom' | string;

export function SkillsDirectory() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error('Failed to load skills');
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill => {
    if (filter === 'all') return true;
    if (filter === 'built-in') return skill.source === 'built-in';
    if (filter === 'custom') return skill.source === 'custom';
    return skill.category === filter;
  });

  const categoryLabels: Record<string, string> = {
    'business-development': '业务拓展',
    'content-production': '内容生产',
    'data-analytics': '数据分析',
    'customer-service': '客户服务',
    'operations': '运营支持',
    'research': '调研研究',
    'general': '通用',
  };

  const tabs = [
    { id: 'all', label: `全部 (${skills.length})` },
    { id: 'built-in', label: '内置' },
    { id: 'custom', label: '自定义' },
    ...Object.entries(categoryLabels)
      .filter(([cat]) => skills.some(s => s.category === cat))
      .map(([cat, label]) => ({
        id: cat,
        label: `${label} (${skills.filter(s => s.category === cat).length})`
      })),
  ];

  if (loading) {
    return <Loading text="加载技能目录中..." />;
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
        icon="⚡"
        title="技能目录"
        description="浏览所有可用技能和使用说明"
      />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/brain">大脑</Link>
        <span> / </span>
        <span>技能目录</span>
      </div>

      <nav className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${filter === tab.id ? styles.active : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {filteredSkills.length === 0 ? (
        <EmptyState
          icon="⚡"
          title="暂无技能"
          description="技能目录为空，请先添加技能。"
        />
      ) : (
        <div className={styles.grid}>
          {filteredSkills.map(skill => (
            <article key={skill.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h3>{skill.name}</h3>
                  {skill.nameEn && (
                    <span className={styles.nameEn}>{skill.nameEn}</span>
                  )}
                </div>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles[skill.source]}`}>
                    {skill.source === 'built-in' ? '内置' : '自定义'}
                  </span>
                  <span className={`${styles.badge} ${styles[skill.status]}`}>
                    {skill.status === 'active' ? '活跃' : skill.status}
                  </span>
                </div>
              </div>

              <p className={styles.description}>{skill.description}</p>

              <div className={styles.cardMeta}>
                {skill.category && (
                  <span className={styles.category}>
                    {categoryLabels[skill.category] || skill.category}
                  </span>
                )}
                {skill.version && (
                  <span className={styles.version}>{skill.version}</span>
                )}
              </div>

              {skill.tags && skill.tags.length > 0 && (
                <div className={styles.tags}>
                  {skill.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}

              {skill.referencedBy && skill.referencedBy.length > 0 && (
                <div className={styles.referencedBy}>
                  <span className={styles.refLabel}>被引用:</span>
                  {skill.referencedBy.map(ref => (
                    <span key={ref} className={styles.refItem}>{ref}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}