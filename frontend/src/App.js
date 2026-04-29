import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Allocator from './components/Allocator';
import SchedulerPanel from './components/SchedulerPanel';
import Predictions from './components/Predictions';

const styles = {
  app: { background: '#0f1117', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Segoe UI, sans-serif' },
  main: { padding: '24px', maxWidth: '1200px', margin: '0 auto' }
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navbar />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/allocator" element={<Allocator />} />
            <Route path="/scheduler" element={<SchedulerPanel />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
