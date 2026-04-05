import React from 'react';
import MovieGrid from '../movies/MovieGrid';

export default function ResultsPanel({ results }) {
  return (
    <section className="panel-card">
      <h5 className="mb-3">Recommended for You</h5>
      <MovieGrid movies={results} />
    </section>
  );
}
