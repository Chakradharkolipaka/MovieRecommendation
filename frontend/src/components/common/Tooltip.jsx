import React from 'react';

export default function Tooltip({ text }) {
  return (
    <span className="tooltip-inline" aria-label={text}>
      ⓘ
      <span className="tooltip-content">{text}</span>
    </span>
  );
}
