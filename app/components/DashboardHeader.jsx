import React from "react";
import { motion } from "framer-motion";
import { MapPin, Brain, Edit3, Target } from "lucide-react";

export default function DashboardHeader({ 
  user, 
  onShuffleOverview, 
  onUpdateBlueprint, 
  onShareProgress,
  deepWorkStats,
  deepWorkGoalInput,
  setDeepWorkGoalInput,
  onSaveDeepWorkGoal,
  formatMinutesToHours 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="lg:col-span-2 rounded-3xl border border-white/10 dark:border-white/10 light:border-gray-200 bg-white/5 dark:bg-white/5 light:bg-white/90 backdrop-blur-xl p-7"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_10px_35px_rgba(79,70,229,0.45)]">
          <div className="absolute inset-0 rounded-2xl border border-white/40 dark:border-white/40 light:border-gray-300" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-white dark:text-white light:text-gray-800">
            {(user.name || "A").charAt(0).toUpperCase()}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50 dark:text-white/50 light:text-gray-500">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white dark:text-white light:text-gray-900">
            Hi {user.name || "Learner"}, ready for tonight&apos;s sprint?
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/70 dark:text-white/70 light:text-gray-600">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white dark:text-white light:text-gray-600" /> Bangalore · IST
            </span>
            {user.email && (
              <span className="px-3 py-1 rounded-full bg-white/10 dark:bg-white/10 light:bg-gray-100 border border-white/20 dark:border-white/20 light:border-gray-300 text-xs text-white dark:text-white light:text-gray-700">
                {user.email}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onShuffleOverview}
          className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
        >
          <Brain className="h-4 w-4" />
          Shuffle Focus
        </button>
        <button
          onClick={onUpdateBlueprint}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/30 light:border-gray-300 px-4 py-2 text-sm text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900"
        >
          <Edit3 className="h-4 w-4" />
          Update Blueprint
        </button>
        <button
          onClick={onShareProgress}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 dark:border-white/20 light:border-gray-300 px-4 py-2 text-sm text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900"
        >
          <Target className="h-4 w-4" />
          Share Progress
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3 items-end">
        <div className="rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/40 dark:bg-black/40 light:bg-gray-100 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 dark:text-white/40 light:text-gray-600">Daily Deep Work Goal</p>
          <div className="mt-2 flex items-baseline gap-2">
            <input
              type="number"
              min={15}
              max={720}
              value={deepWorkGoalInput}
              onChange={(e) => setDeepWorkGoalInput(Number(e.target.value) || 0)}
              className="w-20 rounded-xl border border-white/20 dark:border-white/20 light:border-gray-300 bg-black/40 dark:bg-black/40 light:bg-white px-2 py-1.5 text-sm text-white dark:text-white light:text-gray-800 placeholder:text-white/40 dark:placeholder:text-white/40 light:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
            <span className="text-xs text-white/50 dark:text-white/50 light:text-gray-600">minutes / day</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/40 dark:bg-black/40 light:bg-gray-100 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 dark:text-white/40 light:text-gray-600">Average Session</p>
          <p className="mt-2 text-lg font-semibold text-white/90 dark:text-white/90 light:text-gray-800">
            {formatMinutesToHours(deepWorkStats.averageMinutes || 0)}
          </p>
          <p className="text-[11px] text-white/50 dark:text-white/50 light:text-gray-600 mt-1">
            {deepWorkStats.sessionCount || 0} sessions logged
          </p>
        </div>

        <button
          type="button"
          onClick={onSaveDeepWorkGoal}
          className="rounded-full bg-white/90 text-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white"
        >
          Save Goal
        </button>
      </div>
    </motion.div>
  );
}
