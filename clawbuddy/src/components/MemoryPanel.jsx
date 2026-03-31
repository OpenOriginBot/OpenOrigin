import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MemoryStick, Plus, RefreshCw, Check, X, Loader2, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  submitMemory,
  listMemories,
  getApiStatus,
} from '../services/memoryService';
import { agents } from '../data/mockData';

const categories = [
  { value: 'technical', label: 'Technical', color: '#06b6d4' },
  { value: 'preference', label: 'Preference', color: '#10b981' },
  { value: 'project', label: 'Project', color: '#f59e0b' },
  { value: 'process', label: 'Process', color: '#a78bfa' },
];

function CategoryBadge({ category }) {
  const cat = categories.find((c) => c.value === category);
  return (
    <span
      className="memory-category-badge"
      style={{ '--badge-color': cat?.color || '#6b7280' }}
    >
      {cat?.label || category}
    </span>
  );
}

function MemoryCard({ memory }) {
  return (
    <motion.div
      className="memory-card glass-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="memory-card-header">
        <CategoryBadge category={memory.category} />
        <span className="memory-agent">{memory.agentName}</span>
        <span className="memory-time">
          {formatDistanceToNow(new Date(memory.timestamp), { addSuffix: true })}
        </span>
      </div>
      <p className="memory-content">{memory.content}</p>
    </motion.div>
  );
}

function MemoryForm({ onSubmit, isSubmitting }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('technical');
  const [agentName, setAgentName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || !agentName.trim()) return;
    onSubmit({ content: content.trim(), category, agentName: agentName.trim() });
    setContent('');
  };

  return (
    <form className="memory-form glass-card" onSubmit={handleSubmit}>
      <h3>
        <Plus size={18} />
        Add New Memory
      </h3>

      <div className="form-group">
        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter memory content..."
          rows={3}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Agent Name</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="e.g., Agent Alpha"
            list="agent-list"
            required
          />
          <datalist id="agent-list">
            {agents.map((agent) => (
              <option key={agent.id} value={agent.name} />
            ))}
          </datalist>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting || !content.trim() || !agentName.trim()}>
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check size={16} />
            Save Memory
          </>
        )}
      </button>
    </form>
  );
}

function MemoryPanel() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lastSync, setLastSync] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);

  const apiStatus = getApiStatus();

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    const cat = categoryFilter === 'all' ? undefined : categoryFilter;
    const result = await listMemories(cat);
    if (result.success && result.data) {
      setMemories(result.data);
      setLastSync(new Date());
    }
    setLoading(false);
  }, [categoryFilter]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleSubmit = async ({ content, category, agentName }) => {
    setSubmitting(true);
    setSubmitStatus(null);
    const result = await submitMemory(content, category, agentName);
    if (result.success) {
      setSubmitStatus({ type: 'success', message: 'Memory saved successfully!' });
      fetchMemories();
      setTimeout(() => setSubmitStatus(null), 3000);
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Failed to save memory' });
    }
    setSubmitting(false);
  };

  return (
    <div className="tab-content memory-tab">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="memory-header">
          <div className="memory-title-row">
            <h2>
              <MemoryStick size={24} />
              Memory Bank
            </h2>
            <div className="memory-status">
              <span className={`status-indicator ${apiStatus.configured ? 'connected' : 'disconnected'}`}>
                <span className="status-dot-small"></span>
                {apiStatus.configured ? 'Connected' : 'Configure API URL'}
              </span>
              {lastSync && (
                <span className="last-sync">
                  Last sync: {formatDistanceToNow(lastSync, { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          <div className="memory-actions">
            <div className="filter-pills">
              <button
                className={`filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  className={`filter-pill ${categoryFilter === cat.value ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat.value)}
                  style={{ '--pill-color': cat.color }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={fetchMemories} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Submit Status */}
        {submitStatus && (
          <motion.div
            className={`submit-status ${submitStatus.type}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {submitStatus.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {submitStatus.message}
          </motion.div>
        )}

        <div className="memory-layout">
          {/* Form */}
          <div className="memory-form-container">
            <MemoryForm onSubmit={handleSubmit} isSubmitting={submitting} />
          </div>

          {/* Memory List */}
          <div className="memory-list-container">
            <h3>Saved Memories ({memories.length})</h3>
            {loading ? (
              <div className="memory-loading">
                <Loader2 size={24} className="spin" />
                <span>Loading memories...</span>
              </div>
            ) : memories.length === 0 ? (
              <div className="memory-empty glass-card">
                <MemoryStick size={32} />
                <p>No memories yet</p>
                <span>Add your first memory using the form</span>
              </div>
            ) : (
              <div className="memory-list scrollbar-thin">
                {memories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default MemoryPanel;
