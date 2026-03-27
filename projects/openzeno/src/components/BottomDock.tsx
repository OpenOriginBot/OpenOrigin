import { NavLink } from 'react-router-dom';
import styles from './BottomDock.module.css';

interface BottomDockProps {
  onLogoClick: () => void;
}

const navItems = [
  { path: '/', icon: '📋', label: '运营', emoji: '⚡' },
  { path: '/brain', icon: '🧠', label: '大脑', emoji: '🧠' },
  { path: '/lab', icon: '🧪', label: '实验室', emoji: '🧪' },
];

export function BottomDock({ onLogoClick }: BottomDockProps) {
  return (
    <nav 
      className={styles.dock} 
      role="navigation" 
      aria-label="主导航"
    >
      {/* Logo - Top Left */}
      <button 
        className={styles.logo}
        onClick={onLogoClick}
        aria-label="打开设置"
        title="设置"
      >
        <span className={styles.logoIcon}>⚡</span>
        <span className={styles.logoText}>Zeno</span>
      </button>

      {/* Dock Items */}
      <div className={styles.dockItems}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.dockItem} ${isActive ? styles.active : ''}`
            }
            end={item.path === '/'}
            aria-label={item.label}
            aria-current={item.path === '/' ? 'page' : undefined}
          >
            <span className={styles.icon} role="img" aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.indicator} aria-hidden="true" />
          </NavLink>
        ))}
      </div>

      {/* Spacer for balance */}
      <div className={styles.spacer} />
    </nav>
  );
}
