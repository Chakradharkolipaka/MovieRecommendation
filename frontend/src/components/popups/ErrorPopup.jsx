import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ErrorPopup({ open, error, onRetry, onClose }) {
  if (!error) return null;
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="popup-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="popup-card border border-danger"
            initial={{ x: -10 }}
            animate={{ x: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.2 }}
            role="alertdialog"
            aria-label="Error popup"
          >
            <h5>❌ {error.error}</h5>
            <p>{error.message}</p>
            <span className="badge bg-danger mb-3">Code {error.code}</span>
            <details className="small text-secondary mb-3">
              <summary>What does this mean?</summary>
              {error.timestamp}
            </details>
            <div className="d-flex gap-2">
              <button className="btn btn-danger" onClick={onRetry} aria-label="Try again">
                Try Again
              </button>
              <button className="btn btn-outline-light" onClick={onClose} aria-label="Close error popup">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
