import React from 'react';
import Badge from '../common/Badge';
import Tooltip from '../common/Tooltip';

export default function MovieCard({ movie, index = 0 }) {
  return (
    <article className="movie-card" style={{ animationDelay: `${index * 50}ms` }}>
      <img src={movie.poster_url} alt={movie.title} className="movie-poster" />
      <div className="p-3">
        <h6 className="mb-1">{movie.title}</h6>
        <div className="mb-2">
          {movie.genres.split('|').map((g) => (
            <Badge key={g}>{g}</Badge>
          ))}
        </div>
        <div className="text-warning fw-semibold">
          ★ {Number(movie.score).toFixed(2)} <Tooltip text="Users similar to you liked this highly." />
        </div>
      </div>
    </article>
  );
}
