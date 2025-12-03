import React from "react";
import { motion } from "framer-motion";

export default function OverviewSection({ 
  overview, 
  newOverviewLabel, 
  newOverviewValue, 
  setNewOverviewLabel, 
  setNewOverviewValue, 
  handleAddOverview, 
  handleShuffleOverview, 
  overviewRef 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -25 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7"
      ref={overviewRef}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Overview</p>
          <h2 className="text-2xl font-semibold mt-1">Learning Blueprint</h2>
        </div>
        <button
          onClick={handleShuffleOverview}
          className="text-xs uppercase tracking-[0.3em] text-white/60 border border-white/15 rounded-full px-3 py-1 hover:text-white"
        >
          rotate
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {overview.map(({ label, value, id }) => (
          <div key={id || label} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
            <p className="mt-2 text-lg text-white/90">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr,2fr,auto] items-end">
        <input
          id="overview-label-input"
          value={newOverviewLabel}
          onChange={(e) => setNewOverviewLabel(e.target.value)}
          placeholder="Label (e.g., Secondary Focus)"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <input
          value={newOverviewValue}
          onChange={(e) => setNewOverviewValue(e.target.value)}
          placeholder="Value"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <button
          type="button"
          onClick={handleAddOverview}
          className="rounded-full bg-white/90 text-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white"
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}
