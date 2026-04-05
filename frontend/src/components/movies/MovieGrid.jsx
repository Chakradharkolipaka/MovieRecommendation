import React from 'react';
import MovieCard from './MovieCard';

export default function MovieGrid({ movies = [] }) {
  if (!movies.length) return <div className="empty-state">No results yet. Try a different user or method.</div>;
  return (
    <div className="movie-grid">
      {movies.map((movie, index) => (
        <MovieCard key={`${movie.movieId}-${index}`} movie={movie} index={index} />
      ))}
    </div>
  );
}
