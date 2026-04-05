import React from 'react';

export default function RecommendButton({ onClick, loading }) {
  return (
    <button className="btn btn-danger w-100 fw-semibold" onClick={onClick} disabled={loading} aria-label="Get recommendations">
      {loading ? 'Generating...' : '🎬 Get Recommendations'}
    </button>
  );
}
