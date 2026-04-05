import React from 'react';
import { Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, ResponsiveContainer } from 'recharts';

export default function HeatmapChart({ data = [] }) {
  return (
    <div className="chart-card">
      <h6>Sparsity Heatmap</h6>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart>
          <XAxis dataKey="col" type="number" name="Movie" />
          <YAxis dataKey="row" type="number" name="User" />
          <ZAxis dataKey="value" range={[20, 120]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill="#e50914" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
