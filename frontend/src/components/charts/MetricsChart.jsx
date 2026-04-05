import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function MetricsChart({ metrics }) {
  const data = [
    { key: 'RMSE', value: metrics?.rmse || 0 },
    { key: 'MAE', value: metrics?.mae || 0 },
    { key: 'P@K', value: metrics?.precision_at_k || 0 },
    { key: 'R@K', value: metrics?.recall_at_k || 0 },
  ];

  return (
    <div className="chart-card">
      <h6>Coverage Metrics</h6>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
