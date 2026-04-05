import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats } from '../services/movies';

export default function Home() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="hero-section">
      <h1 className="display-4">Discover Your Next Favorite Film — Powered by AI</h1>
      <p className="text-secondary">Collaborative filtering, cinematic UX, and real-time recommendation storytelling.</p>
      <div className="stats-bar my-3">
        <span>{stats?.total_users ?? '-'} Users</span>
        <span>{stats?.total_movies ?? '-'} Movies</span>
        <span>{stats?.total_ratings ?? '-'} Ratings</span>
        <span>{stats ? `${Math.round((1 - stats.sparsity) * 100)}% Coverage` : '-% Coverage'}</span>
      </div>
      <Link className="btn btn-danger btn-lg" to="/recommend">
        Get My Recommendations
      </Link>
    </div>
  );
}
