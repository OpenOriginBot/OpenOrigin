import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OpsPage } from './components/ops';
import { BrainPage, BrainHub, MemoryViewer, BriefingArchive, SkillsDirectory, CronHealth } from './components/brain';
import { LabPage, PrototypePortfolio, IdeaGallery, ResearchDashboard } from './components/lab';
import { ErrorBoundary } from './components/common';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OpsPage />} />
            <Route path="brain" element={<BrainPage />}>
              <Route index element={<BrainHub />} />
              <Route path="memory" element={<MemoryViewer />} />
              <Route path="briefings" element={<BriefingArchive />} />
              <Route path="skills" element={<SkillsDirectory />} />
              <Route path="cron" element={<CronHealth />} />
            </Route>
            <Route path="lab" element={<LabPage />} />
            <Route path="lab/prototypes" element={<PrototypePortfolio />} />
            <Route path="lab/ideas" element={<IdeaGallery />} />
            <Route path="lab/research" element={<ResearchDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
