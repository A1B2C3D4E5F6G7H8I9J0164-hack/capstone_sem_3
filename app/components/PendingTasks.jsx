import React from "react";

export default function PendingTasks({ 
  isPendingTasksOpen, 
  setIsPendingTasksOpen, 
  pendingTasks, 
  pendingTasksCount 
}) {
  if (!isPendingTasksOpen) return null;

  return (
    <section className="rounded-3xl border border-rose-500/40 bg-black/40 backdrop-blur-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Pending Tasks</p>
          <h2 className="text-xl font-semibold mt-1">Tasks Due Today</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsPendingTasksOpen(false)}
          className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
        >
          close
        </button>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-8 text-center">
          <p className="text-lg text-white/60">No pending tasks for today!</p>
          <p className="text-sm text-white/40 mt-2">Great job staying on top of things.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pendingTasks.map((task) => (
            <div
              key={task._id}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-lg font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-white/60 mt-1">{task.description}</p>
                  )}
                  <p className="text-xs text-white/40 mt-2">
                    Due: {new Date(task.dueDate).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs uppercase tracking-[0.3em] px-3 py-1 rounded-full ${
                  task.priority === "high" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                  task.priority === "medium" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
                  "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-white/50">
        {pendingTasksCount} task{pendingTasksCount !== 1 ? "s" : ""} pending for today
      </p>
    </section>
  );
}
