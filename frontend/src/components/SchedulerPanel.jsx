import React, { useState } from 'react';
import api from '../api';

const card = { background: '#1a1d27', borderRadius: '12px', padding: '20px', border: '1px solid #2d3148', marginBottom: '20px' };
const COLORS = ['#6c63ff', '#00d4aa', '#f59e0b', '#f43f5e', '#818cf8'];
const ALGORITHMS = ['RR', 'SJF', 'FCFS', 'Priority'];

export default function SchedulerPanel() {
  const [algo, setAlgo] = useState('RR');
  const [gantt, setGantt] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/schedule?algorithm=${algo}`);
      setGantt(res.data);
    } catch (e) {}
    setLoading(false);
  };

  const maxEnd = gantt.reduce((m, g) => Math.max(m, g.end_time), 0) || 1;

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '8px' }}>OS Scheduler Simulation</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Simulate Round-Robin, SJF, FCFS, and Priority scheduling</p>

      <div style={card}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ color: '#64748b', fontSize: '13px' }}>Algorithm:</label>
          {ALGORITHMS.map(a => (
            <button key={a} onClick={() => setAlgo(a)} style={{
              background: algo === a ? '#6c63ff' : '#0f1117',
              color: algo === a ? '#fff' : '#94a3b8',
              border: `1px solid ${algo === a ? '#6c63ff' : '#2d3148'}`,
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px'
            }}>{a}</button>
          ))}
          <button onClick={run} disabled={loading} style={{
            background: '#00d4aa', color: '#0f1117', border: 'none',
            borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', marginLeft: 'auto'
          }}>{loading ? 'Running...' : '▶ Run Simulation'}</button>
        </div>
      </div>

      {gantt.length > 0 && (
        <>
          <div style={card}>
            <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Gantt Chart — {algo}</h3>
            <div style={{ overflowX: 'auto' }}>
              {[...new Set(gantt.map(g => g.server))].map(srv => (
                <div key={srv} style={{ marginBottom: '12px' }}>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{srv}</div>
                  <div style={{ position: 'relative', height: '36px', background: '#0f1117', borderRadius: '6px', minWidth: '600px' }}>
                    {gantt.filter(g => g.server === srv).map((g, i) => {
                      const left = (g.start_time / maxEnd) * 100;
                      const width = ((g.end_time - g.start_time) / maxEnd) * 100;
                      return (
                        <div key={i} title={`${g.job_name} [${g.start_time}s – ${g.end_time}s]`} style={{
                          position: 'absolute', left: `${left}%`, width: `${width}%`,
                          height: '36px', background: COLORS[i % COLORS.length],
                          borderRadius: '4px', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '11px', color: '#fff',
                          fontWeight: 600, overflow: 'hidden', boxSizing: 'border-box', padding: '0 4px'
                        }}>{g.job_name}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#475569', fontSize: '11px' }}>
                <span>0s</span><span>{Math.round(maxEnd)}s</span>
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Scheduling Details</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>{['Job', 'Server', 'Start (s)', 'End (s)', 'Wait (s)', 'Turnaround (s)', 'Algorithm'].map(h => (
                  <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #2d3148' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {gantt.map((g, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e2235' }}>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{g.job_name}</td>
                    <td style={{ padding: '10px 12px', color: '#6c63ff' }}>{g.server}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{g.start_time}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{g.end_time}</td>
                    <td style={{ padding: '10px 12px', color: '#f59e0b' }}>{g.wait_time}</td>
                    <td style={{ padding: '10px 12px', color: '#00d4aa' }}>{g.turnaround}</td>
                    <td style={{ padding: '10px 12px', color: '#818cf8' }}>{g.algorithm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
