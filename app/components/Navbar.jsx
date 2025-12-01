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
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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
      className="fixed z-50 top-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[80%] flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-md bg-white/5 dark:bg-white/5 light:bg-gray-100/90 border border-white/10 dark:border-white/10 light:border-gray-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] light:shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-indigo-400" />
        <Link href="/Dashboard" className="text-white dark:text-white light:text-gray-900 font-semibold tracking-wide hover:text-indigo-300 dark:hover:text-indigo-300 light:hover:text-indigo-600 transition">
          LearnSphere AI
        </Link>
      </div>

      <div className="flex items-center gap-6 text-white/70 dark:text-white/70 light:text-gray-700">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>
        <Link href="/Dashboard" className="flex items-center gap-2 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition">
          <Home className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
        </Link>
        <Link href="/Notes" className="flex items-center gap-2 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition">
          <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Notes</span>
        </Link>
        <Link href="/Profile" className="flex items-center gap-2 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition">
          <User className="h-4 w-4" /> <span className="hidden sm:inline">Profile</span>
        </Link>
        <Link href="/Settings" className="flex items-center gap-2 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition">
          <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 hover:text-rose-400 dark:hover:text-rose-400 light:hover:text-rose-600 transition"
        >
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.nav>
  );
}

