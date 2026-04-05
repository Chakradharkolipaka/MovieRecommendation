import React, { useEffect, useState } from 'react';
import HeatmapChart from '../components/charts/HeatmapChart';
import MetricsChart from '../components/charts/MetricsChart';
import { fetchMetrics } from '../services/recommend';
import { fetchStats } from '../services/movies';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats);
    fetchMetrics(1).then(setMetrics).catch(() => setMetrics(null));
  }, []);

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <HeatmapChart data={stats?.heatmap || []} />
      </div>
      <div className="col-lg-4">
        <MetricsChart metrics={metrics} />
      </div>
      <div className="col-12">
        <div className="panel-card">
          <h6>Top Genres</h6>
          <div className="d-flex flex-wrap gap-2">
            {(stats?.top_genres || []).map((g) => (
              <span key={g.genre} className="badge bg-warning text-dark">
                {g.genre} ({g.count})
              </span>
            ))}
          </div>
          <p className="text-warning mt-3 mb-0">Cold Start Warning: users with &lt; 5 ratings will receive insufficient-data alert.</p>
        </div>
      </div>
    </div>
  );
}
