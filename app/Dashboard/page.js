"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, User, Settings, LogOut } from "lucide-react";

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="fixed z-50 top-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[80%] flex items-center justify-between px-6 py-3 rounded-full
                 backdrop-blur-md bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-indigo-400" />
        <span className="text-white font-semibold tracking-wide">LearnSphere AI</span>
      </div>

      <div className="flex items-center gap-6 text-white/70">
        <button className="flex items-center gap-2 hover:text-white transition">
          <Home className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
        </button>
        <button className="flex items-center gap-2 hover:text-white transition">
          <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
        </button>
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
  return (
    <div className="relative min-h-screen bg-[#030303] text-white overflow-hidden">
      <Navbar />

      <main className="pt-32 text-center">
        <h1 className="text-3xl font-semibold text-white/90">Dashboard</h1>
        <p className="mt-4 text-white/60 text-lg">To be continued...</p>
      </main>
    </div>
  );
}