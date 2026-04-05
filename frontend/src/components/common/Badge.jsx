import React from 'react';

export default function Badge({ children, variant = 'secondary' }) {
  return <span className={`badge bg-${variant} me-1`}>{children}</span>;
}
