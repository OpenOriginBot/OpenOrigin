import { useState, useEffect, useCallback } from 'react'
import { fetchMemories, submitMemory, approveMemory, CATEGORIES } from '../../services/api'

const AGENT_NAME = '小猿'

const CATEGORY_COLORS = {
  '技术': '#3b82f6',
  '偏好': '#f59e0b',
  '项目': '#10b981',
  '过程': '#8b5cf6',
}

export default function MemoryRegistry() {
  const [memories, setMemories] = useState([])
  const [filterCategory, setFilterCategory] = useState('')
  const [showPending, setShowPending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Submit form state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [form, setForm] = useState({ agent_name: AGENT_NAME, category: '技术', content: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchMemories({
        category: filterCategory || undefined,
        includePending: showPending,
      })
      setMemories(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [filterCategory, showPending])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) return
    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    try {
      await submitMemory(form)
      setSubmitSuccess('✅ 记忆已提交，等待审批')
      setForm(f => ({ ...f, content: '' }))
      load()
    } catch (e) {
      setSubmitError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (memoryId) => {
    try {
      await approveMemory(memoryId, true)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>🧠 认知记忆系统</h2>

      {/* Submit Form */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-secondary)' }}>
          提交新记忆
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>智能体</span>
              <input
                value={form.agent_name}
                onChange={e => setForm(f => ({ ...f, agent_name: e.target.value }))}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: 'var(--color-text-primary)',
                  fontSize: 14,
                }}
                required
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>类别</span>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: 'var(--color-text-primary)',
                  fontSize: 14,
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>记忆内容</span>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="描述你学到的具体模式、偏好或发现..."
              rows={3}
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--color-text-primary)',
                fontSize: 14,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              required
            />
          </label>
          {submitError && <p style={{ color: '#ef4444', fontSize: 13 }}>❌ {submitError}</p>}
          {submitSuccess && <p style={{ color: '#10b981', fontSize: 13 }}>{submitSuccess}</p>}
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#374151' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            {submitting ? '提交中...' : '提交记忆'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '6px 12px',
            color: 'var(--color-text-primary)',
            fontSize: 13,
          }}
        >
          <option value="">全部类别</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showPending}
            onChange={e => setShowPending(e.target.checked)}
          />
          显示待审批
        </label>
        <button
          onClick={load}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '6px 12px',
            color: 'var(--color-text-secondary)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          🔄 刷新
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: 13,
          color: '#dc2626',
        }}>
          ⚠️ {error}（记忆表可能未创建，请在 Supabase 运行建表 SQL）
        </div>
      )}

      {/* Memory List */}
      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>加载中...</p>
      ) : memories.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>暂无记忆记录</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {memories.map(m => (
            <div
              key={m.id}
              style={{
                background: 'var(--color-surface)',
                border: `1px solid ${m.approved ? 'var(--color-border)' : '#f59e0b'}`,
                borderRadius: 10,
                padding: 16,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    background: CATEGORY_COLORS[m.category] || '#6b7280',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {m.category}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {m.agent_name}
                  </span>
                  {!m.approved && (
                    <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>⏳ 待审批</span>
                  )}
                </div>
                {!m.approved && showPending && (
                  <button
                    onClick={() => handleApprove(m.id)}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    ✅ 批准
                  </button>
                )}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{m.content}</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                {new Date(m.created_at).toLocaleString('zh-CN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
