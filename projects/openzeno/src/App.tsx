import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OpsPage } from './components/ops';
import { BrainPage } from './components/brain';
import { LabPage } from './components/lab';
import { ErrorBoundary } from './components/common';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OpsPage />} />
            <Route path="brain" element={<BrainPage />} />
            <Route path="lab" element={<LabPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
