import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CorrelationChart({ data = [] }) {
  return (
    <div className="chart-card">
      <h6>Top Correlations</h6>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="title" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#f5a623" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
