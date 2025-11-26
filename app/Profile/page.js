"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Edit3,
  Mail,
  MapPin,
  ShieldCheck,
  Calendar,
  Activity,
  Award,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Settings,
} from "lucide-react";
import Navbar from "../components/Navbar";
import HeroBackground from "../components/HeroBackground";

const achievements = [
  {
    title: "AI Fundamentals",
    detail: "Certified · 2025",
    badge: "Top 5%",
  },
  {
    title: "Research Sprint",
    detail: "NLP Systems · 2024",
    badge: "Lead",
  },
  {
    title: "Open Source",
    detail: "Contributed to 8 repos",
    badge: "Community",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Aditya Rana",
    email: "adityaran09102006@gmail.com",
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [overview, setOverview] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const API_BASE = "https://capstone-backend-3-jthr.onrender.com/api";

  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user profile and data
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    const controller = new AbortController();

    // Fetch user profile
    fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setEditedName(data.user.name);
        }
      })
      .catch(() => {});

    // Fetch streak
    fetch(`${API_BASE}/dashboard/streak`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCurrentStreak(data.currentStreak || 0);
          setMaxStreak(data.maxStreak || 0);
        }
      })
      .catch(() => {});

    // Fetch overview
    fetch(`${API_BASE}/dashboard/overview`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.length > 0) {
          setOverview(data.slice(0, 3));
        }
      })
      .catch(() => {});

    // Fetch milestones
    fetch(`${API_BASE}/dashboard/milestones`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.length > 0) {
          setMilestones(data.slice(0, 3));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [router]);

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    
    // In a real app, this would update the name via API
    setUser({ ...user, name: editedName.trim() });
    setIsEditMode(false);
    alert("Name updated successfully!");
  };

  const quickStats = [
    { 
      label: "Active Streak", 
      value: `${currentStreak} days`, 
      icon: Activity, 
      accent: "from-indigo-500/20",
      onClick: () => router.push("/Dashboard"),
    },
    { 
      label: "Max Streak", 
      value: `${maxStreak} days`, 
      icon: TrendingUp, 
      accent: "from-violet-500/20",
      onClick: () => router.push("/Dashboard"),
    },
    { 
      label: "Completed Tasks", 
      value: "15", 
      icon: ShieldCheck, 
      accent: "from-emerald-500/20",
      onClick: () => router.push("/Dashboard"),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] dark:bg-[#030303] bg-white text-white dark:text-white overflow-hidden">
      <HeroBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90 dark:from-black/40 dark:via-black/60 dark:to-black/90" />

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-8 flex flex-col gap-8 lg:flex-row lg:items-center"
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_20px_60px_rgba(79,70,229,0.35)]">
                <div className="absolute inset-0 rounded-3xl border border-white/40" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white">
                  {(user.name || "A").charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">Profile</p>
              {isEditMode ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-semibold tracking-tight bg-black/40 border border-white/20 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setEditedName(user.name);
                    }}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-semibold tracking-tight">{user.name || "User"}</h1>
              )}
              <p className="text-white/60 flex items-center gap-3 mt-1">
                <Mail className="h-4 w-4" />
                {user.email || "No email"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 lg:ml-auto">
            <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition">
              <MapPin className="h-4 w-4" />
              Bangalore, IN
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20 transition"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
            <Link
              href="/Settings"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </motion.section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quickStats.map(({ label, value, icon: Icon, accent, onClick }, index) => (
            <motion.button
              key={label}
              onClick={onClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`text-left rounded-2xl border border-white/10 bg-gradient-to-br ${accent} via-white/5 to-transparent p-6 backdrop-blur hover:border-white/30 transition cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">{label}</p>
                <Icon className="h-5 w-5 text-white/70" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{value}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                <span>View details</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-7 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Overview</p>
                <h2 className="text-2xl font-semibold mt-1">Learning Blueprint</h2>
              </div>
              <Link
                href="/Dashboard"
                className="text-xs uppercase tracking-[0.3em] text-white/60 border border-white/15 rounded-full px-3 py-1 hover:text-white hover:border-white/30 transition flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-5">
              {overview.length > 0 ? (
                overview.map((item) => (
                  <div
                    key={item._id || item.label}
                    className="flex flex-col rounded-2xl border border-white/5 bg-black/20 p-4 hover:bg-black/30 transition cursor-pointer"
                    onClick={() => router.push("/Dashboard")}
                  >
                    <p className="text-sm uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                    <p className="mt-2 text-lg text-white/90">{item.value}</p>
                  </div>
                ))
              ) : (
                [
                  { label: "Primary Focus", value: "AI Systems & Research" },
                  { label: "Current Sprint", value: "Multi-modal Retrieval (Week 2)" },
                  { label: "Mentor", value: "Dr. Elina Kapoor · Thursdays, 8 PM" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col rounded-2xl border border-white/5 bg-black/20 p-4 hover:bg-black/30 transition cursor-pointer"
                    onClick={() => router.push("/Dashboard")}
                  >
                    <p className="text-sm uppercase tracking-[0.2em] text-white/40">{label}</p>
                    <p className="mt-2 text-lg text-white/90">{value}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-lg p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Progress</p>
                <h2 className="text-2xl font-semibold mt-1">Achievements</h2>
              </div>
              <Award className="h-5 w-5 text-white/50" />
            </div>

            <div className="mt-5 space-y-4">
              {achievements.map(({ title, detail, badge }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 flex items-center justify-between hover:bg-black/50 transition cursor-pointer"
                >
                  <div>
                    <p className="text-base font-medium">{title}</p>
                    <p className="text-sm text-white/60">{detail}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/50 border border-white/15 rounded-full px-3 py-1">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Timeline</p>
              <h2 className="text-2xl font-semibold mt-1">Upcoming Milestones</h2>
            </div>
            <Link
              href="/Dashboard"
              className="text-xs uppercase tracking-[0.3em] text-white/60 border border-white/15 rounded-full px-3 py-1 hover:text-white hover:border-white/30 transition flex items-center gap-2"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {milestones.length > 0 ? (
              milestones.map((milestone) => (
                <div
                  key={milestone._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4 hover:bg-black/40 transition cursor-pointer"
                  onClick={() => router.push("/Dashboard")}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                    <div>
                      <p className="text-lg font-medium">{milestone.title}</p>
                      <p className="text-sm text-white/60">{milestone.detail}</p>
                    </div>
                  </div>
                  <span className="mt-2 md:mt-0 text-xs uppercase tracking-[0.3em] text-white/50 border border-white/15 rounded-full px-4 py-1">
                    {milestone.state}
                  </span>
                </div>
              ))
            ) : (
              [
                { title: "Prototype Review", detail: "AR Learning Companion · Nov 28", status: "Scheduled" },
                { title: "Team Sync", detail: "System Integration · Dec 04", status: "In progress" },
                { title: "Research Paper Submission", detail: "SIGED · Dec 15", status: "Drafting" },
              ].map(({ title, detail, status }, idx) => (
                <div
                  key={title}
                  className="flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4 hover:bg-black/40 transition cursor-pointer"
                  onClick={() => router.push("/Dashboard")}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                    <div>
                      <p className="text-lg font-medium">{title}</p>
                      <p className="text-sm text-white/60">{detail}</p>
                    </div>
                  </div>
                  <span className="mt-2 md:mt-0 text-xs uppercase tracking-[0.3em] text-white/50 border border-white/15 rounded-full px-4 py-1">
                    {status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
