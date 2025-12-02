import React from "react";
import { Clock4 } from "lucide-react";

export default function FocusTimer({ 
  isFocusTimerOpen, 
  setIsFocusTimerOpen, 
  focusMinutes, 
  setFocusMinutes, 
  formattedFocusTime, 
  isFocusRunning, 
  handleStartFocus, 
  handlePauseFocus, 
  handleResetFocus 
}) {
  if (!isFocusTimerOpen) return null;

  return (
    <section className="rounded-3xl border border-indigo-500/40 bg-black/40 backdrop-blur-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Deep Work Session</p>
          <h2 className="text-xl font-semibold mt-1">Custom focus timer</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsFocusTimerOpen(false)}
          className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
        >
          close
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="rounded-2xl border border-white/20 bg-black/50 px-5 py-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Remaining</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{formattedFocusTime}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-white/60" htmlFor="focus-minutes">
            Session length (minutes)
          </label>
          <input
            id="focus-minutes"
            type="number"
            min={1}
            max={180}
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(Number(e.target.value) || 0)}
            className="w-28 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleStartFocus}
          className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 transition"
        >
          <Clock4 className="h-4 w-4" />
          Start
        </button>
        <button
          type="button"
          onClick={handlePauseFocus}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 hover:text-white"
        >
          {isFocusRunning ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={handleResetFocus}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60 hover:text-white"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-white/50">
        When the timer hits zero, you&apos;ll get a completion alert so you can log or celebrate your deep work
        sprint.
      </p>
    </section>
  );
}
