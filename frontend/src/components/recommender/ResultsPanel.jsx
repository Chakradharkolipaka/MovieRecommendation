import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MovieCard from './MovieCard';

export default function ResultsPanel({ results, onRate }) {
  return (
    <section className="panel-card">
      <h5 className="mb-3">Recommended for You</h5>
      {!results.length ? <div className="empty-state">No results yet. Try a different user or method.</div> : null}
      <div className="movie-grid">
        <AnimatePresence>
          {results.map((movie, index) => (
            <motion.div key={movie.movieId} layoutId={`movie-${movie.movieId}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, delay: index * 0.05 }}>
              <MovieCard movie={movie} index={index} onRate={onRate} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
