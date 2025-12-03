import React from "react";
import { motion } from "framer-motion";

export default function StatsCards({ 
  currentStreak, 
  maxStreak, 
  deepWorkStats, 
  pendingTasksCount, 
  formatMinutesToHours, 
  setIsStreakDetailsOpen, 
  setIsFocusTimerOpen, 
  setIsPendingTasksOpen, 
  formattedFocusTime, 
  isFocusRunning 
}) {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      <motion.button
        type="button"
        onClick={() => setIsStreakDetailsOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
        className="text-left rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/30 via-white/5 p-5 backdrop-blur hover:border-indigo-400/70 cursor-pointer focus:outline-none"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Focus Score</p>
        <div className="mt-3 space-y-2">
          <div>
            <p className="text-2xl font-semibold">Max Streak: {maxStreak}</p>
            <p className="text-lg font-medium text-indigo-300/80">Current: {currentStreak}</p>
          </div>
        </div>
        <p className="mt-1 text-sm text-white/70">Keep the streak going! (tap to view details)</p>
      </motion.button>
      
      {[
        {
          title: "Deep Work Avg",
          value: formatMinutesToHours(deepWorkStats.averageMinutes || 0),
          meta: `Goal: ${formatMinutesToHours(deepWorkStats.dailyGoalMinutes || 0)}`,
          accent: "from-cyan-500/30 via-white/5",
        },
        {
          title: "Pending Reviews",
          value: String(pendingTasksCount).padStart(2, "0"),
          meta: `${pendingTasksCount} due today`,
          accent: "from-rose-500/20 via-white/5",
        },
      ].map(({ title, value, meta, accent }, idx) => {
        const isDeepWork = title === "Deep Work Avg";
        const isPendingReviews = title === "Pending Reviews";
        return (
          <motion.button
            key={title}
            type="button"
            onClick={() => {
              if (isDeepWork) setIsFocusTimerOpen(true);
              if (isPendingReviews) setIsPendingTasksOpen(true);
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx + 1) * 0.1 }}
            className={`text-left rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-5 backdrop-blur focus:outline-none hover:border-indigo-400/70 cursor-pointer`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-white/70">{meta}</p>
            {isDeepWork && (
              <p className="mt-3 text-xs text-indigo-100/80">
                Timer: {formattedFocusTime} · {isFocusRunning ? "Running" : "Idle"} (tap card to open controls)
              </p>
            )}
            {isPendingReviews && (
              <p className="mt-3 text-xs text-rose-100/80">
                Tap to view and manage tasks
              </p>
            )}
          </motion.button>
        );
      })}
    </section>
  );
}
