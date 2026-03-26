import { NavLink, Outlet } from 'react-router-dom';
import './AppShell.css';

const NAV_ITEMS = [
  { path: '/ops', label: 'Ops', icon: '📦', desc: '任务交付' },
  { path: '/brain', label: 'Brain', icon: '🧠', desc: '每日简报' },
  { path: '/lab', label: 'Lab', icon: '🔬', desc: '实验原型' },
];

export default function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🦧</span>
          <span className="brand-name">小猿工作台</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-text">
                <span className="nav-label">{item.label}</span>
                <span className="nav-desc">{item.desc}</span>
              </div>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="footer-hint">客户服务业务版</span>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
