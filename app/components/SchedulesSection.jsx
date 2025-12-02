import React from "react";
import { motion } from "framer-motion";
import { ListPlus, Check, Trash2 } from "lucide-react";

export default function SchedulesSection({ 
  scheduleItems, 
  newScheduleTime, 
  newScheduleTitle, 
  newScheduleDetail, 
  handleAddSchedule,
  handleCompleteSchedule,
  handleDeleteSchedule,
  setNewScheduleTime,
  setNewScheduleTitle,
  setNewScheduleDetail
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-black/20 to-black/40 backdrop-blur-xl p-7"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Schedules</p>
          <h2 className="text-xl font-semibold mt-1">Today&apos;s Flow</h2>
        </div>
        <button
          onClick={handleAddSchedule}
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white"
        >
          <ListPlus className="h-4 w-4" />
          Add
        </button>
      </div>
      <div className="space-y-3">
        {scheduleItems.map(({ title, time, detail, id, taskId }, idx) => (
          <div key={id || `${title}-${idx}`} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{time}</span>
              <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">slot</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCompleteSchedule(id, taskId)}
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition"
                    title="Mark as done"
                  >
                    <Check className="h-4 w-4 text-emerald-300" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(id, taskId)}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-rose-300" />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-lg font-medium">{title}</p>
            <p className="text-sm text-white/60">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[0.9fr,1.2fr,auto] items-end">
        <input
          value={newScheduleTime}
          onChange={(e) => setNewScheduleTime(e.target.value)}
          placeholder="Time (e.g., 18:00 - 19:30)"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <input
          value={newScheduleTitle}
          onChange={(e) => setNewScheduleTitle(e.target.value)}
          placeholder="Title & detail"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <input
          value={newScheduleDetail}
          onChange={(e) => setNewScheduleDetail(e.target.value)}
          placeholder="Notes (optional)"
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 md:col-span-3 lg:col-span-1"
        />
      </div>
    </motion.div>
  );
}
