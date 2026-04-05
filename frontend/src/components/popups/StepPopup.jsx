import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function StepPopup({ open, steps = [], currentStep = 0 }) {
  const progress = steps.length ? Math.round((currentStep / steps.length) * 100) : 0;
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-label="Recommendation progress"
        >
          <motion.div className="popup-card" initial={{ y: 20 }} animate={{ y: 0 }}>
            <h5 className="mb-3">Running Recommendation Pipeline</h5>
            <div className="progress mb-3" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar bg-danger" style={{ width: `${progress}%` }} />
            </div>
            <ul className="list-unstyled small mb-0">
              {steps.map((step, idx) => (
                <li key={step} className={idx < currentStep ? 'text-success' : 'text-secondary'}>
                  Step {idx + 1}/{steps.length} {idx < currentStep ? '✅' : '⏳'} {step}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
