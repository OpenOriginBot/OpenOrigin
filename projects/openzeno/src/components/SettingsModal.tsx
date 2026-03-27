import { useEffect, useRef } from 'react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className={styles.modal}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2 id="settings-title" className={styles.title}>⚙️ 设置</h2>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="关闭设置"
          >
            ✕
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>🎯 关于</h3>
            <div className={styles.info}>
              <p><strong>OpenZeno</strong></p>
              <p className={styles.version}>版本 1.0.0</p>
              <p className={styles.desc}>电商 AI 代理操作系统仪表板</p>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>📋 快捷导航</h3>
            <ul className={styles.linkList}>
              <li><a href="/" onClick={onClose}>📋 运营模块</a></li>
              <li><a href="/brain" onClick={onClose}>🧠 大脑模块</a></li>
              <li><a href="/lab" onClick={onClose}>🧪 实验室模块</a></li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>🔧 系统信息</h3>
            <div className={styles.info}>
              <p>布局：底部停靠栏 (macOS 风格)</p>
              <p>状态：运行中</p>
              <p>主题：深色停靠栏 / 浅色内容区</p>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <p>由 OpenClaw 驱动</p>
        </footer>
      </div>
    </div>
  );
}
