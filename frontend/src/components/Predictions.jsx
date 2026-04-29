import React, { useEffect, useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api';

const card = { background: '#1a1d27', borderRadius: '12px', padding: '20px', border: '1px solid #2d3148', marginBottom: '20px' };

export default function Predictions() {
  const [servers, setServers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/servers').then(r => {
      setServers(r.data);
      if (r.data.length) setSelectedId(String(r.data[0].id));
    }).catch(() => {});
  }, []);

  const load = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/predict/${id}`);
      setData(res.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { if (selectedId) load(selectedId); }, [selectedId]);

  const trendColor = data?.trend === 'increasing' ? '#f43f5e' : data?.trend === 'decreasing' ? '#00d4aa' : '#f59e0b';
  const trendIcon = data?.trend === 'increasing' ? '📈' : data?.trend === 'decreasing' ? '📉' : '➡️';

  const chartData = data?.predictions?.map(p => ({
    ...p,
    cpu_high: Math.min(100, p.cpu_predicted + (100 - p.confidence) / 2),
    cpu_low: Math.max(0, p.cpu_predicted - (100 - p.confidence) / 2),
  }));

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', marginBottom: '8px' }}>ML Load Predictions</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>RandomForest — 2-hour forecast in 5-minute intervals</p>

      <div style={card}>
        <label style={{ color: '#64748b', fontSize: '13px', marginRight: '12px' }}>Select Server:</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{
          background: '#0f1117', border: '1px solid #2d3148', borderRadius: '8px',
          color: '#e2e8f0', padding: '8px 14px', fontSize: '14px'
        }}>
          {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading && <p style={{ color: '#64748b', textAlign: 'center' }}>Loading predictions...</p>}

      {data && !loading && (
        <>
          <div style={card}>
            <h3 style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
              Load Forecast — {data.server_name} (Next 2 Hours)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData}>
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="cpu_high" fill="#6c63ff" stroke="none" fillOpacity={0.15} name="CPU Confidence" />
                <Area type="monotone" dataKey="cpu_low" fill="#0f1117" stroke="none" fillOpacity={1} legendType="none" />
                <Line type="monotone" dataKey="cpu_predicted" stroke="#f59e0b" strokeWidth={2} dot={false} name="CPU %" />
                <Line type="monotone" dataKey="mem_predicted" stroke="#00d4aa" strokeWidth={2} dot={false} name="MEM %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              ['Trend', `${trendIcon} ${data.trend}`, trendColor],
              ['Peak CPU (predicted)', `${Math.max(...data.predictions.map(p => p.cpu_predicted)).toFixed(1)}%`, '#f59e0b'],
              ['Avg Confidence', `${(data.predictions.reduce((s, p) => s + p.confidence, 0) / data.predictions.length).toFixed(1)}%`, '#6c63ff'],
            ].map(([label, value, color]) => (
              <div key={label} style={card}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{label}</div>
                <div style={{ color, fontWeight: 700, fontSize: '22px', marginTop: '8px', textTransform: 'capitalize' }}>{value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
