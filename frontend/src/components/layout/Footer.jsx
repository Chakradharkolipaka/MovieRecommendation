import React from 'react';

export default function Footer() {
  return (
    <footer className="text-center text-secondary py-3 border-top border-dark-subtle">
      Built with FastAPI + React • Free-tier ready • {new Date().getFullYear()}
    </footer>
  );
}
