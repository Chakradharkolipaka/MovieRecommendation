import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function StatChip({ label, value, color }) {
  const styles = {
    amber: 'text-warning bg-warning-subtle',
    green: 'text-success bg-success-subtle',
    blue: 'text-info bg-info-subtle',
  };
  return (
    <div className={`px-2 py-1 rounded ${styles[color] || styles.blue}`}>
      <div className="fw-semibold" style={{ fontSize: 11 }}>{value}</div>
      <div className="text-secondary" style={{ fontSize: 9 }}>{label}</div>
    </div>
  );
}

export default function WhyButton({ explanation }) {
  const [open, setOpen] = useState(false);
  if (!explanation) return null;

  return (
    <div className="w-100">
      <button type="button" onClick={() => setOpen((o) => !o)} className="btn btn-sm btn-outline-light py-0 px-2">
        {open ? '▲' : '▼'} Why this?
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2">
            <div className="p-2 rounded border border-white-10 bg-dark-subtle">
              <p className="small text-secondary mb-2">{explanation.human}</p>
              <div className="d-flex gap-2 mb-2">
                <StatChip label="Neighbors" value={explanation.neighbor_count} color="amber" />
                <StatChip label="Avg Rating" value={`${explanation.avg_neighbor_rating}★`} color="green" />
                <StatChip label="Similarity" value={`${Math.round((explanation.top_similarity || 0) * 100)}%`} color="blue" />
              </div>
              {Array.isArray(explanation.genre_overlap) && explanation.genre_overlap.length > 0 ? (
                <div className="d-flex flex-wrap gap-1">
                  {explanation.genre_overlap.map((g) => (
                    <span key={g} className="badge text-bg-warning-subtle text-warning-emphasis">{g}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
