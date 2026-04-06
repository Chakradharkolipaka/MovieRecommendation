import React, { useState } from 'react';
import WhyButton from '../common/WhyButton';
import StarRating from '../common/StarRating';

function titleGradient(title) {
  let hash = 0;
  for (const ch of title || '') hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(160deg, hsl(${h1},35%,18%), hsl(${h2},45%,12%))`;
}

export default function MovieCard({ movie, index = 0, onRate }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const showPoster = movie.poster_url && !imgError;
  const genres = String(movie.genres || '').split('|').filter(Boolean);
  const predicted = Number(movie.score ?? movie.predicted_score ?? 0);
  const similarity = Number(movie.similarity_score ?? 0);

  return (
    <article className="movie-card" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="position-relative" style={{ aspectRatio: '2 / 3', overflow: 'hidden' }}>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: titleGradient(movie.title) }} />
        {showPoster ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            style={{
              opacity: imgLoaded ? 1 : 0,
              filter: imgLoaded ? 'blur(0px)' : 'blur(3px)',
              transition: 'opacity 700ms ease, filter 700ms ease',
            }}
          />
        ) : null}

        <div className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill bg-dark bg-opacity-75 text-warning" style={{ fontSize: 12 }}>
          ★ {predicted.toFixed(1)}
        </div>
        <div className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded-pill bg-dark bg-opacity-75 text-success" style={{ fontSize: 12 }}>
          {Math.round(similarity * 100)}% match
        </div>
      </div>

      <div className="p-3">
        <h6 className="mb-1 text-white">{movie.title}</h6>
        <div className="d-flex flex-wrap gap-1 mb-2">
          {genres.slice(0, 3).map((g) => (
            <span key={g} className="badge text-bg-dark border border-light-subtle">{g}</span>
          ))}
        </div>

        <div className="d-flex align-items-start justify-content-between gap-2">
          <WhyButton explanation={movie.explanation} />
          <StarRating movieId={movie.movieId} onRate={onRate} />
        </div>
      </div>
    </article>
  );
}
