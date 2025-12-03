import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function MilestonesSection({ 
  milestones, 
  newMilestoneTitle, 
  newMilestoneDetail, 
  newMilestoneState, 
  handleAddMilestone, 
  setNewMilestoneTitle, 
  setNewMilestoneDetail, 
  setNewMilestoneState 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Milestones</p>
          <h2 className="text-2xl font-semibold mt-1">Next commitments</h2>
        </div>
        <Calendar className="h-5 w-5 text-white/60" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {milestones.map(({ title, detail, state, id }) => (
          <div key={id || title} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{state}</p>
            <p className="mt-2 text-lg font-semibold">{title}</p>
            <p className="text-sm text-white/60">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr,1.2fr,0.8fr,auto] items-end">
        <input
          value={newMilestoneTitle}
          onChange={(e) => setNewMilestoneTitle(e.target.value)}
          placeholder="Milestone title"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <input
          value={newMilestoneDetail}
          onChange={(e) => setNewMilestoneDetail(e.target.value)}
          placeholder="Detail (date · context)"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <input
          value={newMilestoneState}
          onChange={(e) => setNewMilestoneState(e.target.value)}
          placeholder="State (Ready / Draft / Planned)"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <button
          type="button"
          onClick={handleAddMilestone}
          className="rounded-full bg-white/90 text-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white"
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}
