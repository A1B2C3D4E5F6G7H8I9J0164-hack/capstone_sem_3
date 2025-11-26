"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  User,
  Settings,
  LogOut,
  Sparkles,
  Upload,
  Target,
  Brain,
  Calendar,
  Clock4,
  ListPlus,
  MapPin,
  Edit3,
} from "lucide-react";

const streakData = [
  { day: "Mon", hours: 3.5, target: 4 },
  { day: "Tue", hours: 4.8, target: 5 },
  { day: "Wed", hours: 2.4, target: 4 },
  { day: "Thu", hours: 5.2, target: 5 },
  { day: "Fri", hours: 3.9, target: 4 },
  { day: "Sat", hours: 6, target: 6 },
  { day: "Sun", hours: 2, target: 3 },
];

// quickPanels will be dynamic now, defined in component

const initialOverview = [
  { label: "Current Sprint", value: "Multi-modal Retrieval · Week 2" },
  { label: "Primary Focus", value: "Prototype refinement & latency tests" },
  { label: "Mentor Sync", value: "Elina Kapoor · Thu, 8 PM" },
];

const initialSchedules = [
  { title: "Paper Breakdown", time: "10:00 - 11:30", detail: "Survey visual-language datasets" },
  { title: "Team Sync", time: "13:00 - 13:45", detail: "Model integration checkpoints" },
  { title: "Build Sprint", time: "19:00 - 21:30", detail: "Inference pipeline review" },
];

const milestoneCards = [
  { title: "Prototype Demo", detail: "Nov 28 · XR Lab", state: "Ready" },
  { title: "Research Draft", detail: "Dec 04 · SIGED", state: "Editing" },
  { title: "Mentor Review", detail: "Dec 08 · Remote", state: "Scheduled" },
];

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="fixed z-50 top-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[80%] flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-md bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-indigo-400" />
        <span className="text-white font-semibold tracking-wide">LearnSphere AI</span>
      </div>

      <div className="flex items-center gap-6 text-white/70">
        <Link href="/Dashboard" className="flex items-center gap-2 hover:text-white transition">
          <Home className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
        </Link>
        <Link href="/Profile" className="flex items-center gap-2 hover:text-white transition">
          <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
        </Link>
        <button className="flex items-center gap-2 hover:text-white transition">
          <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
        </button>
        <button className="flex items-center gap-2 hover:text-rose-400 transition">
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.nav>
  );
}

export default function DashboardPage() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [overview, setOverview] = useState(initialOverview);
  const [scheduleItems, setScheduleItems] = useState(initialSchedules);
  const [milestones, setMilestones] = useState(milestoneCards);
  const [user, setUser] = useState({
    name: "Aditya Rana",
    email: "aditya@learnsphere.ai",
  });

  // Streak state
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState(null);

  // Deep work timer state
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  // Pending tasks state
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isPendingTasksOpen, setIsPendingTasksOpen] = useState(false);
  const [isStreakDetailsOpen, setIsStreakDetailsOpen] = useState(false);

  // Inline form state
  const [newOverviewLabel, setNewOverviewLabel] = useState("");
  const [newOverviewValue, setNewOverviewValue] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [newScheduleDetail, setNewScheduleDetail] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDetail, setNewMilestoneDetail] = useState("");
  const [newMilestoneState, setNewMilestoneState] = useState("");

  const aiPlaceholder = useMemo(
    () =>
      "Drop raw notes or bullet dumps.\nExample: 'Highlights from diffusion architectures, key papers, deployment blockers...'",
    []
  );

  // API base URL
  const API_BASE = "https://capstone-backend-3-jthr.onrender.com/api";

  // Function to get auth headers
  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load streak data from backend
  const fetchStreak = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/streak`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentStreak(data.currentStreak || 0);
        setMaxStreak(data.maxStreak || 0);
        setLastActivityDate(data.lastActivityDate || null);
      }
    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  };

  // Function to update streak when user opens/edits something
  const updateStreak = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/streak/update`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentStreak(data.currentStreak || 0);
        setMaxStreak(data.maxStreak || 0);
        setLastActivityDate(data.lastActivityDate || null);
      }
    } catch (err) {
      console.error("Error updating streak:", err);
    }
  };

  // Fetch milestones from backend
  const fetchMilestones = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/milestones`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMilestones(data.map((m) => ({
            title: m.title,
            detail: m.detail,
            state: m.state,
            id: m._id,
          })));
        }
      }
    } catch (err) {
      console.error("Error fetching milestones:", err);
    }
  };

  // Fetch overview from backend
  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/overview`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setOverview(data.map((o) => ({
            label: o.label,
            value: o.value,
            id: o._id,
          })));
        }
      }
    } catch (err) {
      console.error("Error fetching overview:", err);
    }
  };

  // Fetch schedules from backend
  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/schedules`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setScheduleItems(data.map((s) => ({
            title: s.title,
            time: s.time,
            detail: s.detail,
            id: s._id,
          })));
        }
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  // Fetch pending tasks for today
  const fetchPendingTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/tasks/pending-today`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPendingTasksCount(data.count || 0);
        setPendingTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Error fetching pending tasks:", err);
    }
  };

  // Load all data on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadData = async () => {
      await fetchStreak();
      await fetchMilestones();
      await fetchOverview();
      await fetchSchedules();
      await fetchPendingTasks();
      await updateStreak(); // Update streak when opening dashboard
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown effect for deep work timer
  useEffect(() => {
    if (!isFocusRunning || remainingSeconds <= 0) return;

    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsFocusRunning(false);
          if (typeof window !== "undefined") {
            alert("Deep work session complete! Great job staying focused.");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isFocusRunning, remainingSeconds]);

  const formattedFocusTime = useMemo(() => {
    const total = remainingSeconds || focusMinutes * 60;
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remainingSeconds, focusMinutes]);

  const handleSummarize = () => {
    if (!notes.trim()) {
      setSummary("Add some notes first so I can craft a summary for you.");
      return;
    }
    setIsSummarizing(true);
    updateStreak();
    setTimeout(() => {
      const clean = notes.replace(/\s+/g, " ").trim();
      const snippets = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
      const bullets = clean
        .split(/,|\./)
        .map((s) => s.trim())
        .filter((s) => s.length > 5)
        .slice(0, 3);

      const generated = [
        snippets.slice(0, 2).join(" ") || clean.slice(0, 160),
        "",
        "Key takeaways:",
        ...bullets.map((item, idx) => `${idx + 1}. ${item}`),
      ]
        .filter(Boolean)
        .join("\n");

      setSummary(generated);
      setIsSummarizing(false);
    }, 900);
  };

  const handleShuffleOverview = () => {
    setOverview((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const handleAddOverview = async () => {
    if (!newOverviewLabel.trim() || !newOverviewValue.trim()) return;
    
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/dashboard/overview`, {
        method: "POST",
        headers: { 
          ...headers, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          label: newOverviewLabel.trim(),
          value: newOverviewValue.trim(),
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setOverview((prev) => [...prev, { label: data.label, value: data.value, id: data._id }]);
        setNewOverviewLabel("");
        setNewOverviewValue("");
        updateStreak();
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        console.error("Error creating overview:", errorData);
        alert(`Failed to create overview: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating overview:", err);
      alert(`Network error: ${err.message}. Please check your connection and try again.`);
    }
  };

  const handleAddSchedule = async () => {
    if (!newScheduleTitle.trim()) return;
    
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/dashboard/schedules`, {
        method: "POST",
        headers: { 
          ...headers, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          title: newScheduleTitle.trim(),
          time: newScheduleTime.trim() || "Custom",
          detail: newScheduleDetail.trim() || "Tap to edit details",
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setScheduleItems((prev) => [
          ...prev,
          {
            title: data.title,
            time: data.time,
            detail: data.detail,
            id: data._id,
          },
        ]);
        setNewScheduleTitle("");
        setNewScheduleTime("");
        setNewScheduleDetail("");
        updateStreak();
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        console.error("Error creating schedule:", errorData);
        alert(`Failed to create schedule: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert(`Network error: ${err.message}. Please check your connection and try again.`);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneTitle.trim()) return;
    
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/dashboard/milestones`, {
        method: "POST",
        headers: { 
          ...headers, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          title: newMilestoneTitle.trim(),
          detail: newMilestoneDetail.trim() || "Details coming soon",
          state: newMilestoneState.trim() || "Planned",
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMilestones((prev) => [
          ...prev,
          {
            title: data.title,
            detail: data.detail,
            state: data.state,
            id: data._id,
          },
        ]);
        setNewMilestoneTitle("");
        setNewMilestoneDetail("");
        setNewMilestoneState("");
        updateStreak();
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        console.error("Error creating milestone:", errorData);
        alert(`Failed to create milestone: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating milestone:", err);
      alert(`Network error: ${err.message}. Please check your connection and try again.`);
    }
  };

  const handleShareProgress = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("LearnSphere AI – Progress Report", 20, 20);

      doc.setFontSize(11);
      doc.text(`Name: ${user.name || "Aditya Rana"}`, 20, 32);
      if (user.email) {
        doc.text(`Email: ${user.email}`, 20, 38);
      } else {
        doc.text("Location: Bangalore, IN", 20, 38);
      }

      doc.text("Learning Blueprint:", 20, 50);
      overview.forEach((item, idx) => {
        doc.text(`- ${item.label}: ${item.value}`, 24, 58 + idx * 6);
      });

      const schedulesStart = 58 + overview.length * 6 + 6;
      doc.text("Schedules:", 20, schedulesStart);
      scheduleItems.forEach((item, idx) => {
        doc.text(`- ${item.time} · ${item.title}: ${item.detail}`, 24, schedulesStart + 8 + idx * 6);
      });

      let milestonesStart = schedulesStart + 8 + scheduleItems.length * 6 + 6;
      doc.text("Milestones:", 20, milestonesStart);
      milestones.forEach((m, idx) => {
        doc.text(`- [${m.state}] ${m.title}: ${m.detail}`, 24, milestonesStart + 8 + idx * 6);
      });

      doc.save("learnsphere-progress.pdf");
    } catch (err) {
      console.error("Failed to generate PDF. Make sure 'jspdf' is installed.", err);
      alert("To enable PDF export, run `npm install jspdf` in the frontend project, then try again.");
    }
  };

  const handleStartFocus = () => {
    const mins = Number.isFinite(focusMinutes) ? Math.max(1, focusMinutes) : 25;
    setFocusMinutes(mins);
    setRemainingSeconds(mins * 60);
    setIsFocusRunning(true);
  };

  const handlePauseFocus = () => {
    setIsFocusRunning((prev) => !prev);
  };

  const handleResetFocus = () => {
    setIsFocusRunning(false);
    setRemainingSeconds(0);
  };

  // Fetch user profile using JWT from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const controller = new AbortController();

    fetch("https://capstone-backend-3-jthr.onrender.com/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser((prev) => ({
            ...prev,
            ...data.user,
          }));
        }
      })
      .catch(() => {
        // ignore network/profile errors in UI
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(121,80,255,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black/95" />

      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16 space-y-10">
        <section className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_10px_35px_rgba(79,70,229,0.45)]">
                <div className="absolute inset-0 rounded-2xl border border-white/40" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-white">
                  {(user.name || "A").charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Dashboard</p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Hi {user.name || "Learner"}, ready for tonight&apos;s sprint?
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Bangalore · IST
                  </span>
                  {user.email && (
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleShuffleOverview}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                <Brain className="h-4 w-4" />
                Shuffle Focus
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm text-white/80 hover:text-white">
                <Edit3 className="h-4 w-4" />
                Update Blueprint
              </button>
              <button
                onClick={handleShareProgress}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
              >
                <Target className="h-4 w-4" />
                Share Progress
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Energy Graph</p>
              <Clock4 className="h-5 w-5 text-white/60" />
            </div>
            <div className="mt-2 overflow-x-auto">
              <div className="flex items-end gap-4 h-40 min-w-[26rem]">
                {streakData.map(({ day, hours, target }) => {
                  const percentage = Math.min((hours / target) * 100, 100);
                  return (
                    <div key={day} className="flex flex-col items-center gap-2 text-sm">
                      <div className="relative w-10 h-32 rounded-2xl bg-white/5 overflow-hidden border border-white/10">
                        <div className="absolute inset-x-0 bottom-0" style={{ height: `${percentage}%` }}>
                          <div className="h-full w-full bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-400" />
                        </div>
                      </div>
                      <span className="text-xs text-white/60">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-white/50">
              <p>Goal: 5h avg / day</p>
              <p>+18% vs last week</p>
            </div>
          </motion.div>
        </section>

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
            { title: "Deep Work Avg", value: "2h 45m", meta: "Goal: 3h", accent: "from-cyan-500/30 via-white/5" },
            { title: "Pending Reviews", value: String(pendingTasksCount).padStart(2, "0"), meta: `${pendingTasksCount} due today`, accent: "from-rose-500/20 via-white/5" },
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

        {isFocusTimerOpen && (
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
        )}

        {/* Streak Details Modal */}
        {isStreakDetailsOpen && (
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
        )}

        {/* Pending Tasks Modal */}
        {isPendingTasksOpen && (
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
        )}

        <section className="grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7"
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
              {scheduleItems.map(({ title, time, detail, id }, idx) => (
                <div key={id || `${title}-${idx}`} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>{time}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">slot</span>
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
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
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

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {isSummarizing ? "Summarizing..." : "Summarize"}
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white">
                <Upload className="h-4 w-4" />
                Attach
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 min-h-[140px]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">AI Summary</p>
              <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                {summary || "Your condensed insights will appear here right after the AI finishes crafting them."}
              </pre>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

