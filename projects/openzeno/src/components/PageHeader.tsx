import styles from './PageHeader.module.css';

interface Tab {
  id: string;
  label: string;
}

interface PageHeaderProps {
  title: string;
  icon: string;
  description?: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  icon, 
  description,
  tabs,
  activeTab,
  onTabChange,
  actions 
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <div className={styles.titleGroup}>
          <span className={styles.icon} role="img" aria-hidden="true">{icon}</span>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {tabs && tabs.length > 0 && (
        <nav className={styles.tabs} role="tablist" aria-label={`${title} 子导航`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
