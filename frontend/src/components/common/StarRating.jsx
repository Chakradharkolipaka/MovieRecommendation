import React, { useState } from 'react';

export default function StarRating({ movieId, onRate, initialRating = 0 }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(initialRating);
  const [submitted, setSubmitted] = useState(initialRating > 0);

  const display = hovered || selected;

  const handleRate = (rating) => {
    setSelected(rating);
    setSubmitted(true);
    onRate(movieId, rating);
  };

  return (
    <div className="d-flex align-items-center gap-1" title="Rate this movie">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => handleRate(star)}
          className="btn btn-link p-0 text-decoration-none"
          style={{
            color: star <= display ? '#f5a623' : 'rgba(255,255,255,0.25)',
            transform: star <= display ? 'scale(1.08)' : 'scale(1)',
            fontSize: 16,
            lineHeight: 1,
          }}
          aria-label={`Rate ${star} star`}
        >
          ★
        </button>
      ))}
      {submitted ? <span className="text-success" style={{ fontSize: 10 }}>✓</span> : null}
    </div>
  );
}
