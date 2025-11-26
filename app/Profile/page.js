"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
} from "lucide-react";

const quickStats = [
  { label: "Active Streak", value: "12 days", icon: Activity, accent: "from-indigo-500/20" },
  { label: "Courses Active", value: "04", icon: Target, accent: "from-violet-500/20" },
  { label: "Completed Projects", value: "15", icon: ShieldCheck, accent: "from-emerald-500/20" },
];

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
  const [user, setUser] = useState({
    name: "Aditya Rana",
    email: "adityaran09102006@gmail.com",
  });

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(121,80,255,0.2),_transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-10">
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
              <h1 className="text-3xl font-semibold tracking-tight">{user.name || "User"}</h1>
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
            <button className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20 transition">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </motion.section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quickStats.map(({ label, value, icon: Icon, accent }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accent} via-white/5 to-transparent p-6 backdrop-blur`}
            >
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">{label}</p>
                <Icon className="h-5 w-5 text-white/70" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{value}</p>
            </motion.div>
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
              <User className="h-5 w-5 text-white/50" />
            </div>

            <div className="space-y-5">
              {[
                { label: "Primary Focus", value: "AI Systems & Research" },
                { label: "Current Sprint", value: "Multi-modal Retrieval (Week 2)" },
                { label: "Mentor", value: "Dr. Elina Kapoor · Thursdays, 8 PM" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col rounded-2xl border border-white/5 bg-black/20 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/40">{label}</p>
                  <p className="mt-2 text-lg text-white/90">{value}</p>
                </div>
              ))}
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
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 flex items-center justify-between"
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
            <Calendar className="h-5 w-5 text-white/50" />
          </div>

          <div className="space-y-4">
            {[
              { title: "Prototype Review", detail: "AR Learning Companion · Nov 28", status: "Scheduled" },
              { title: "Team Sync", detail: "System Integration · Dec 04", status: "In progress" },
              { title: "Research Paper Submission", detail: "SIGED · Dec 15", status: "Drafting" },
            ].map(({ title, detail, status }, idx) => (
              <div
                key={title}
                className="flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
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
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

