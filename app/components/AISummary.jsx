import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload } from "lucide-react";

export default function AISummary({ 
  notes, 
  summary, 
  isSummarizing, 
  aiPlaceholder, 
  handleSummarize, 
  handleAttachClick, 
  attachInputRef, 
  handleAttachFileChange, 
  setNotes, 
  updateStreak 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-600/20 via-black/40 to-black/70 backdrop-blur-xl p-7 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">AI Copilot</p>
          <h2 className="text-2xl font-semibold mt-1">Notes to Summary</h2>
        </div>
        <Sparkles className="h-5 w-5 text-indigo-200" />
      </div>

      <p className="text-sm text-white/70">
        Paste lecture dumps, research snippets, or meeting scribbles. The AI trims noise and surfaces what you
        actually need to remember.
      </p>

      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          if (e.target.value.trim()) updateStreak();
        }}
        placeholder={aiPlaceholder}
        rows={6}
        className="w-full rounded-2xl border border-white/15 bg-black/40 p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 resize-none"
      />

      <input
        ref={attachInputRef}
        type="file"
        accept=".txt,.md,text/plain"
        className="hidden"
        onChange={handleAttachFileChange}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {isSummarizing ? "Summarizing..." : "Summarize"}
        </button>
        <button
          type="button"
          onClick={handleAttachClick}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white"
        >
          <Upload className="h-4 w-4" />
          Attach
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 min-h-[140px]">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">AI Summary</p>
        {isSummarizing ? (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Generating summary with AI...</span>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
            {summary || "Your condensed insights will appear here right after the AI finishes crafting them."}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
