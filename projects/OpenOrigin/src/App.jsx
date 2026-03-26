import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import TaskManager from './modules/Ops/TaskManager';
import DailyBriefing from './modules/Brain/DailyBriefing';
import ExperimentDashboard from './modules/Lab/ExperimentDashboard';

export default function App() {
  return (
    <BrowserRouter basename="/OpenOrigin">
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>👈 从左侧选择模块开始</div>} />
          <Route path="ops" element={<TaskManager />} />
          <Route path="brain" element={<DailyBriefing />} />
          <Route path="lab" element={<ExperimentDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
