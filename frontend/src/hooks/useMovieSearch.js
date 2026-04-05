import { useEffect, useState } from 'react';
import { fetchMovies } from '../services/movies';

export function useMovieSearch(initial = { search: '', genre: '', page: 1 }) {
  const [query, setQuery] = useState(initial);
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchMovies(query);
        if (!mounted) return;
        setMovies(data.movies);
        setTotal(data.total);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [query]);

  return { query, setQuery, movies, total, loading };
}
