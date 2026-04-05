import React from 'react';

export default function MovieSearch({ search, genre, onChange }) {
  return (
    <div className="d-flex flex-column flex-md-row gap-2 mb-3">
      <input
        className="form-control"
        placeholder="Search movie title..."
        value={search}
        onChange={(e) => onChange({ search: e.target.value })}
        aria-label="Search movies"
      />
      <input
        className="form-control"
        placeholder="Filter genre..."
        value={genre}
        onChange={(e) => onChange({ genre: e.target.value })}
        aria-label="Filter by genre"
      />
    </div>
  );
}
