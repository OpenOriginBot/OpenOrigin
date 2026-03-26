import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';
import { formatDate } from '../../utils/date';
import { Card, CardBody, Button, EmptyState, LoadingSpinner } from '../../components/common';
import brainSeed from '../../data/brainSeed.json';
import './DailyBriefing.css';

export default function DailyBriefing() {
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBriefing, setNewBriefing] = useState({ title: '', summary: '', content: '' });

  useEffect(() => {
    loadBriefings();
  }, []);

  function loadBriefings() {
    try {
      const stored = storage.load(STORAGE_KEYS.BRAIN_BRIEFINGS);
      if (stored && stored.briefings && stored.briefings.length > 0) {
        setBriefings(stored.briefings);
      } else {
        setBriefings(brainSeed.briefings);
        storage.save(STORAGE_KEYS.BRAIN_BRIEFINGS, { briefings: brainSeed.briefings });
      }
    } catch (e) {
      setError('加载简报失败：' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function persist(briefingList) {
    setBriefings(briefingList);
    storage.save(STORAGE_KEYS.BRAIN_BRIEFINGS, { briefings: briefingList });
  }

  function handleCreate() {
    if (!newBriefing.title.trim()) {
      alert('请输入标题');
      return;
    }
    const created = {
      id: Date.now().toString(36),
      title: newBriefing.title,
      date: new Date().toISOString().split('T')[0],
      summary: newBriefing.summary,
      content: newBriefing.content || `# ${newBriefing.title}\n\n`,
      createdAt: new Date().toISOString(),
    };
    persist([created, ...briefings]);
    setNewBriefing({ title: '', summary: '', content: '' });
    setShowNewForm(false);
    setExpandedId(created.id);
  }

  function handleDelete(id) {
    if (!window.confirm('确认删除此简报？')) return;
    persist(briefings.filter(b => b.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-msg">❌ {error}</div>;

  return (
    <div className="daily-briefing">
      <div className="module-header">
        <div>
          <h1 className="module-title">🧠 Brain</h1>
          <p className="module-subtitle">每日简报 · 最新在前</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          {showNewForm ? '取消' : '+ 新建简报'}
        </Button>
      </div>

      {/* New Briefing Form */}
      {showNewForm && (
        <Card className="new-briefing-card">
          <CardBody>
            <div className="new-form">
              <input
                className="briefing-title-input"
                placeholder="简报标题，如：2026-03-26 早间简报"
                value={newBriefing.title}
                onChange={e => setNewBriefing({ ...newBriefing, title: e.target.value })}
              />
              <textarea
                className="briefing-summary-input"
                placeholder="简报摘要（简短总结，一句话）"
                rows="2"
                value={newBriefing.summary}
                onChange={e => setNewBriefing({ ...newBriefing, summary: e.target.value })}
              />
              <textarea
                className="briefing-content-input"
                placeholder="完整内容（Markdown格式）"
                rows="10"
                value={newBriefing.content}
                onChange={e => setNewBriefing({ ...newBriefing, content: e.target.value })}
              />
              <div className="new-form-actions">
                <Button variant="secondary" size="sm" onClick={() => setShowNewForm(false)}>取消</Button>
                <Button size="sm" onClick={handleCreate}>发布简报</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Briefing List */}
      {briefings.length === 0 ? (
        <EmptyState
          icon="🧠"
          title="暂无简报"
          description="创建第一份每日简报"
          action={<Button onClick={() => setShowNewForm(true)}>新建简报</Button>}
        />
      ) : (
        <div className="briefing-list">
          {briefings.map(briefing => (
            <Card key={briefing.id} className={expandedId === briefing.id ? 'briefing-expanded' : ''}>
              <CardBody>
                <div
                  className="briefing-header"
                  onClick={() => setExpandedId(expandedId === briefing.id ? null : briefing.id)}
                >
                  <div className="briefing-meta">
                    <span className="briefing-date">📅 {formatDate(briefing.date)}</span>
                  </div>
                  <div className="briefing-title-row">
                    <h3 className="briefing-title">{briefing.title}</h3>
                    <div className="briefing-chevron">
                      {expandedId === briefing.id ? '▲' : '▼'}
                    </div>
                  </div>
                  {expandedId !== briefing.id && briefing.summary && (
                    <p className="briefing-summary-preview">{briefing.summary}</p>
                  )}
                </div>

                {expandedId === briefing.id && (
                  <div className="briefing-expanded-body">
                    {briefing.summary && (
                      <div className="briefing-summary-box">
                        <strong>摘要：</strong>{briefing.summary}
                      </div>
                    )}
                    <div className="briefing-content">
                      <ReactMarkdown>{briefing.content}</ReactMarkdown>
                    </div>
                    <div className="briefing-actions">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(briefing.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
