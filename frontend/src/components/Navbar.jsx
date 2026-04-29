import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: '⚡ Dashboard' },
  { to: '/allocator', label: '🎯 Allocator' },
  { to: '/scheduler', label: '🗂 Scheduler' },
  { to: '/predictions', label: '🔮 Predictions' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2d3148', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#6c63ff', fontWeight: 700, fontSize: '16px', marginRight: '24px', padding: '16px 0' }}>
        SRAF
      </span>
      {links.map(l => (
        <Link key={l.to} to={l.to} style={{
          color: pathname === l.to ? '#6c63ff' : '#94a3b8',
          textDecoration: 'none', padding: '16px 12px', fontSize: '14px',
          borderBottom: pathname === l.to ? '2px solid #6c63ff' : '2px solid transparent',
          fontWeight: pathname === l.to ? 600 : 400
        }}>{l.label}</Link>
      ))}
    </nav>
  );
}
