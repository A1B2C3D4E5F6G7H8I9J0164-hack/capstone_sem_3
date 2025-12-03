import React from "react";
import { Upload, Activity } from "lucide-react";

export default function ProgressModal({ 
  isProgressModalOpen, 
  setIsProgressModalOpen, 
  currentStreak, 
  maxStreak, 
  deepWorkStats, 
  pendingTasksCount, 
  energyGraphData, 
  overview, 
  milestones, 
  scheduleItems, 
  user, 
  handleShareProgress, 
  formatMinutesToHours 
}) {
  if (!isProgressModalOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/15 bg-black/90 px-6 py-6 md:px-8 md:py-7 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Progress Overview</p>
            <h2 className="mt-1 text-xl md:text-2xl font-semibold text-white">Your learning snapshot</h2>
            <p className="mt-1 text-xs md:text-sm text-white/60">
              Quick view of streaks, focus time, weekly activity and milestones. Use this before sharing or downloading.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await handleShareProgress();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-xs md:text-sm font-semibold hover:bg-white/90 transition"
            >
              <Upload className="h-4 w-4" />
              Download report
            </button>
            <button
              type="button"
              onClick={() => setIsProgressModalOpen(false)}
              className="rounded-full border border-white/30 px-3 py-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Focus Streak</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-300">{currentStreak} days</p>
            <p className="text-xs text-white/60 mt-1">Max streak: {maxStreak} days</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Deep Work</p>
            <p className="mt-2 text-lg font-semibold text-white/90">
              {formatMinutesToHours(deepWorkStats.totalFocusMinutes || 0)} total
            </p>
            <p className="text-xs text-white/60 mt-1">
              {deepWorkStats.sessionCount || 0} sessions · Avg {formatMinutesToHours(deepWorkStats.averageMinutes || 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Pending Work</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{pendingTasksCount}</p>
            <p className="text-xs text-white/60 mt-1">tasks due today</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 items-stretch">
          <div className="md:col-span-2 rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/60 dark:bg-black/60 light:bg-gray-100 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-white/80 dark:text-white/80 light:text-gray-700" />
                <p className="text-xs font-medium text-white/80 dark:text-white/80 light:text-gray-700">Weekly activity</p>
              </div>
              <p className="text-[11px] text-white/50 dark:text-white/50 light:text-gray-600">
                {Array.isArray(energyGraphData) ? energyGraphData.reduce((sum, d) => sum + (d.completed || 0), 0) : 0} completed ·
                {" "}
                {Array.isArray(energyGraphData) ? energyGraphData.reduce((sum, d) => sum + (d.pending || 0), 0) : 0} pending
              </p>
            </div>
            <div className="mt-1 flex items-end gap-1.5 h-28">
              {Array.isArray(energyGraphData) && energyGraphData.length > 0 ? (
                energyGraphData.map((d) => {
                  const total = Math.max(1, d.total || 0);
                  const completed = d.completed || 0;
                  const pending = d.pending || 0;
                  const completedHeight = (completed / total) * 100;
                  const pendingHeight = (pending / total) * 100;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center h-full group">
                      <div className="relative w-5 h-full flex flex-col justify-end">
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 dark:from-emerald-500 light:from-emerald-600 to-emerald-400 dark:to-emerald-400 light:to-emerald-500 shadow-sm shadow-emerald-500/30 transition-all duration-300 group-hover:shadow-md group-hover:shadow-emerald-500/40"
                          style={{ height: `${completedHeight}%` }}
                        />
                        {pending > 0 && (
                          <div
                            className="w-full bg-gradient-to-b from-rose-400 dark:from-rose-400 light:from-rose-600 to-rose-500 dark:to-rose-500 light:to-rose-700 rounded-b-md shadow-sm shadow-rose-500/30 transition-all duration-300 group-hover:shadow-md group-hover:shadow-rose-500/40"
                            style={{ height: `${pendingHeight}%` }}
                          />
                        )}
                      </div>
                      <span className="mt-1 text-[10px] text-white/40 dark:text-white/40 light:text-gray-500 group-hover:text-white/60 dark:group-hover:text-white/60 light:group-hover:text-gray-700 transition-colors">{(d.day || '').slice(0, 1)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-white/50 dark:text-white/50 light:text-gray-600">
                  No weekly data yet
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/60 dark:bg-black/60 light:bg-gray-100 px-4 py-3 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 dark:text-white/40 light:text-gray-600 mb-2">Milestones</p>
            <div className="space-y-1 flex-1 overflow-y-auto max-h-40">
              {milestones && milestones.length > 0 ? (
                milestones.slice(0, 4).map((m) => (
                  <div key={m.id || m.title} className="text-xs text-white/70 dark:text-white/70 light:text-gray-700 flex items-center justify-between gap-2">
                    <span className="truncate">{m.title}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 dark:text-white/40 light:text-gray-500">{m.state}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/50 dark:text-white/50 light:text-gray-600">No milestones yet</p>
              )}
            </div>
            {milestones && milestones.length > 4 && (
              <p className="mt-1 text-[10px] text-white/40 dark:text-white/40 light:text-gray-500">+{milestones.length - 4} more</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
