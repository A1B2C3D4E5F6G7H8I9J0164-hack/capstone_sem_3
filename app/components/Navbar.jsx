"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  User,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.push("/Login");
    }
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="fixed z-50 top-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[80%] flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-md bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-indigo-400" />
        <Link href="/Dashboard" className="text-white font-semibold tracking-wide hover:text-indigo-300 transition">
          LearnSphere AI
        </Link>
      </div>

      <div className="flex items-center gap-6 text-white/70">
        <Link href="/Dashboard" className="flex items-center gap-2 hover:text-white transition">
          <Home className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
        </Link>
        <Link href="/Notes" className="flex items-center gap-2 hover:text-white transition">
          <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Notes</span>
        </Link>
        <Link href="/Profile" className="flex items-center gap-2 hover:text-white transition">
          <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
        </Link>
        <Link href="/Settings" className="flex items-center gap-2 hover:text-white transition">
          <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 hover:text-rose-400 transition"
        >
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.nav>
  );
}

