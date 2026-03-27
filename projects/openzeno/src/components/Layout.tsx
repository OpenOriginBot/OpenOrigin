import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { BottomDock } from './BottomDock';
import { SettingsModal } from './SettingsModal';
import styles from './Layout.module.css';

export function Layout() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomDock onLogoClick={() => setSettingsOpen(true)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
