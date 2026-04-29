import React, { useEffect, useState } from 'react';
import api from '../api';

const card = { background: '#1a1d27', borderRadius: '12px', padding: '20px', border: '1px solid #2d3148', marginBottom: '20px' };
const input = { background: '#0f1117', border: '1px solid #2d3148', borderRadius: '8px', color: '#e2e8f0', padding: '10px 14px', width: '100%', boxSizing: 'border-box', fontSize: '14px' };
const btn = { background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' };

export default function Allocator() {
  const [form, setForm] = useState({ name: '', cpu_required: 30, mem_required: 30, priority: 2, duration_ms: 2000 });
  const [result, setResult] = useState(null);
  const [allocs, setAllocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAllocs = () => api.get('/allocations').then(r => setAllocs(r.data)).catch(() => {});

  useEffect(() => { loadAllocs(); }, []);

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const jobRes = await api.post('/jobs', form);
      const allocRes = await api.post('/allocate', { job_id: jobRes.data.id });
      setResult(allocRes.data);
      loadAllocs();
    } catch (e) {
      setError(e.response?.data?.detail || 'Allocation failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '8px' }}>Resource Allocator</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Greedy Best-Fit Knapsack Algorithm</p>

      <div style={card}>
        <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Create & Allocate Job</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ color: '#64748b', fontSize: '12px' }}>Job Name</label>
            <input style={{ ...input, marginTop: '4px' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. MLTraining-Job" />
          </div>
          <div>
            <label style={{ color: '#64748b', fontSize: '12px' }}>Priority (1–5)</label>
            <input style={{ ...input, marginTop: '4px' }} type="number" min="1" max="5" value={form.priority} onChange={e => setForm({ ...form, priority: +e.target.value })} />
          </div>
          <div>
            <label style={{ color: '#64748b', fontSize: '12px' }}>CPU Required: {form.cpu_required}%</label>
            <input type="range" min="1" max="100" value={form.cpu_required} onChange={e => setForm({ ...form, cpu_required: +e.target.value })} style={{ width: '100%', marginTop: '8px', accentColor: '#6c63ff' }} />
          </div>
          <div>
            <label style={{ color: '#64748b', fontSize: '12px' }}>MEM Required: {form.mem_required}%</label>
            <input type="range" min="1" max="100" value={form.mem_required} onChange={e => setForm({ ...form, mem_required: +e.target.value })} style={{ width: '100%', marginTop: '8px', accentColor: '#6c63ff' }} />
          </div>
          <div>
            <label style={{ color: '#64748b', fontSize: '12px' }}>Duration (ms)</label>
            <input style={{ ...input, marginTop: '4px' }} type="number" value={form.duration_ms} onChange={e => setForm({ ...form, duration_ms: +e.target.value })} />
          </div>
        </div>
        {error && <p style={{ color: '#f43f5e', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}
        <button style={btn} onClick={handleSubmit} disabled={loading || !form.name}>
          {loading ? 'Allocating...' : '🚀 Allocate Job'}
        </button>
      </div>

      {result && (
        <div style={{ ...card, border: '1px solid #00d4aa' }}>
          <h3 style={{ color: '#00d4aa', marginBottom: '12px' }}>✅ Allocation Result</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[['Server', result.server_name], ['Fit Score', result.fit_score], ['Algorithm', result.algorithm],
              ['Remaining CPU', `${result.remaining_cpu}%`], ['Remaining MEM', `${result.remaining_mem}%`]].map(([k, v]) => (
              <div key={k} style={{ background: '#0f1117', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{k}</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginTop: '4px' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={card}>
        <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Allocation History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>{['#', 'Job', 'Server', 'Algorithm', 'Time'].map(h => (
              <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #2d3148' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {allocs.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #1e2235' }}>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{a.id}</td>
                <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{a.job_name}</td>
                <td style={{ padding: '10px 12px', color: '#6c63ff' }}>{a.server_name}</td>
                <td style={{ padding: '10px 12px', color: '#00d4aa' }}>{a.algorithm_used}</td>
                <td style={{ padding: '10px 12px', color: '#64748b' }}>{a.allocated_at?.slice(0, 19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {allocs.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No allocations yet</p>}
      </div>
    </div>
  );
}
