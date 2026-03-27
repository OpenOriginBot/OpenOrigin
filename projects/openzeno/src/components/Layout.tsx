import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>OpenZeno</span>
        </div>
        <nav className={styles.nav}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            end
          >
            <span className={styles.navIcon}>📋</span>
            <span>运营</span>
          </NavLink>
          <NavLink 
            to="/brain" 
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>🧠</span>
            <span>大脑</span>
          </NavLink>
          <NavLink 
            to="/lab" 
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>🧪</span>
            <span>实验室</span>
          </NavLink>
        </nav>
        <div className={styles.footer}>
          <span className={styles.version}>v1.0.0</span>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
