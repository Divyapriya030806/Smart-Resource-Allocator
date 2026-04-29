import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../api';

const card = { background: '#1a1d27', borderRadius: '12px', padding: '20px', border: '1px solid #2d3148' };
const COLORS = ['#6c63ff', '#00d4aa', '#f59e0b', '#f43f5e'];

function colorForLoad(v) {
  if (v >= 80) return '#f43f5e';
  if (v >= 50) return '#f59e0b';
  return '#00d4aa';
}

export default function Dashboard() {
  const [servers, setServers] = useState([]);
  const [history, setHistory] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    api.get('/servers').then(r => setServers(r.data)).catch(() => {});

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/live`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setServers(prev => prev.map(s => s.id === d.server_id
        ? { ...s, current_cpu: d.cpu_percent, current_mem: d.mem_percent } : s));
      setHistory(prev => {
        const last = prev[prev.length - 1] || {};
        if (last.time === d.timestamp && last[d.name] !== undefined) return prev;
        const point = { time: d.timestamp, [d.name]: d.cpu_percent };
        const updated = [...prev.slice(-19), point];
        return updated;
      });
    };
    return () => ws.close();
  }, []);

  const pieData = servers.map(s => ({ name: s.name, value: Math.round(s.current_cpu) }));

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '8px' }}>System Dashboard</h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Live server metrics via WebSocket</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {servers.map((s, i) => (
          <div key={s.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{s.name}</span>
              <span style={{ background: s.status === 'active' ? '#064e3b' : '#7f1d1d', color: s.status === 'active' ? '#00d4aa' : '#f43f5e', borderRadius: '999px', padding: '2px 10px', fontSize: '11px' }}>{s.status}</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>CPU</span><span style={{ color: colorForLoad(s.current_cpu) }}>{Math.round(s.current_cpu)}%</span>
              </div>
              <div style={{ background: '#0f1117', borderRadius: '4px', height: '6px' }}>
                <div style={{ width: `${s.current_cpu}%`, background: colorForLoad(s.current_cpu), height: '6px', borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>MEM</span><span style={{ color: colorForLoad(s.current_mem) }}>{Math.round(s.current_mem)}%</span>
              </div>
              <div style={{ background: '#0f1117', borderRadius: '4px', height: '6px' }}>
                <div style={{ width: `${s.current_mem}%`, background: colorForLoad(s.current_mem), height: '6px', borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div style={card}>
          <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Live CPU % — All Servers</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={history}>
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px' }} />
              <Legend />
              {servers.map((s, i) => (
                <Line key={s.id} type="monotone" dataKey={s.name} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Load Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
