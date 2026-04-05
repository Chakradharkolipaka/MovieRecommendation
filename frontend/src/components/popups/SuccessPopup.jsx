import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SuccessPopup({ open, message }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="toast-success"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          aria-live="polite"
        >
          ✅ {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
