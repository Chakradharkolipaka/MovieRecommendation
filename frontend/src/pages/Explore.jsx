import React, { useState } from 'react';
import CorrelationChart from '../components/charts/CorrelationChart';
import MovieGrid from '../components/movies/MovieGrid';
import MovieSearch from '../components/movies/MovieSearch';
import Spinner from '../components/common/Spinner';
import { useMovieSearch } from '../hooks/useMovieSearch';
import { fetchCorrelations } from '../services/movies';

export default function Explore() {
  const { query, setQuery, movies, total, loading } = useMovieSearch();
  const [correlations, setCorrelations] = useState([]);

  const onChange = (partial) => setQuery((q) => ({ ...q, ...partial, page: 1 }));
  const onMovieClick = async () => {
    if (!movies.length) return;
    const data = await fetchCorrelations(movies[0].title);
    setCorrelations(data.correlations || []);
  };

  return (
    <div>
      <h3 className="mb-3">Explore Movie Catalog</h3>
      <MovieSearch search={query.search} genre={query.genre} onChange={onChange} />
      <div className="d-flex justify-content-between mb-2">
        <span className="text-secondary">{total} movies</span>
        <button className="btn btn-outline-warning btn-sm" onClick={onMovieClick}>
          Load Similar Movies
        </button>
      </div>
      {loading ? <Spinner label="Loading movies..." /> : <MovieGrid movies={movies} />}
      <div className="mt-4">
        <CorrelationChart data={correlations} />
      </div>
    </div>
  );
}
