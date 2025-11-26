"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Save,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "../components/Navbar";
import HeroBackground from "../components/HeroBackground";
import { useTheme } from "../components/ThemeProvider";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    language: "en",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://capstone-backend-3-jthr.onrender.com/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate save - in real app, this would call an API
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    
    setIsSaving(true);
    // In real app, this would call an API to change password
    setTimeout(() => {
      setIsSaving(false);
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password changed successfully!");
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] dark:bg-[#030303] bg-white text-white dark:text-white overflow-hidden">
      <HeroBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black/95 dark:from-black/30 dark:via-black/70 dark:to-black/95" />

      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Settings</h1>
              <p className="text-white/60 mt-1">Manage your account and preferences</p>
            </div>
          </div>

          {/* Profile Settings */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Name</label>
                <input
                  type="text"
                  value={user.name || ""}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Email</label>
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white/60 cursor-not-allowed"
                />
                <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </section>

          {/* Password Settings */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password
              </h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>
            {showPasswordForm && (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="Enter current password"
                    />
                    <button
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="Confirm new password"
                    />
                    <button
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="w-full rounded-full bg-indigo-500 hover:bg-indigo-600 px-6 py-3 font-semibold transition disabled:opacity-50"
                >
                  {isSaving ? "Changing..." : "Change Password"}
                </button>
              </div>
            )}
          </section>

          {/* Notification Settings */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-white/60">Receive notifications in your browser</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                  className={`relative w-14 h-8 rounded-full transition ${
                    settings.notifications ? "bg-indigo-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition ${
                      settings.notifications ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-white/60">Receive updates via email</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                  className={`relative w-14 h-8 rounded-full transition ${
                    settings.emailNotifications ? "bg-indigo-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition ${
                      settings.emailNotifications ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Appearance Settings */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-400" />
                  )}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-white/60">Toggle between light and dark theme</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-8 rounded-full transition ${
                    theme === "dark" ? "bg-indigo-500" : "bg-amber-500"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition ${
                      theme === "dark" ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
                <label className="font-medium mb-2 block">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-6 py-4 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </motion.div>
      </main>
    </div>
  );
}

