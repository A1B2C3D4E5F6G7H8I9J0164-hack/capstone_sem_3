import React from "react";

export default function StreakDetails({ 
  isStreakDetailsOpen, 
  setIsStreakDetailsOpen, 
  currentStreak, 
  maxStreak, 
  lastActivityDate 
}) {
  if (!isStreakDetailsOpen) return null;

  return (
    <section className="rounded-3xl border border-indigo-500/40 bg-black/40 backdrop-blur-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Streak Details</p>
          <h2 className="text-xl font-semibold mt-1">Your Focus Streak</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsStreakDetailsOpen(false)}
          className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
        >
          close
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/20 bg-black/50 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Current Streak</p>
          <p className="mt-2 text-4xl font-semibold text-indigo-300">{currentStreak}</p>
          <p className="mt-1 text-sm text-white/60">days in a row</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-black/50 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Max Streak</p>
          <p className="mt-2 text-4xl font-semibold text-purple-300">{maxStreak}</p>
          <p className="mt-1 text-sm text-white/60">best record</p>
        </div>
      </div>

      {lastActivityDate && (
        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Last Activity</p>
          <p className="mt-2 text-sm text-white/80">{new Date(lastActivityDate).toLocaleDateString()}</p>
        </div>
      )}

      <p className="text-xs text-white/50">
        Your streak increases when you open or edit something in the app. Keep it going!
      </p>
    </section>
  );
}
