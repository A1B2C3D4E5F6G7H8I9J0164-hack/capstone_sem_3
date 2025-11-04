"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🩵 LOGIN HANDLER
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("✅ Login successful!");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🩶 SIGNUP HANDLER
  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("http://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Signup successful! You can now log in.");
        setIsLogin(true);
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen text-white overflow-hidden relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div className="relative flex w-[90%] max-w-5xl overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-neutral-800 bg-neutral-950/90">
        {/* Image Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login-img" : "signup-img"}
            initial={{ x: isLogin ? "-100%" : "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLogin ? "100%" : "-100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hidden md:block w-1/2 h-[700px] relative"
          >
            <img
              src={
                isLogin
                  ? "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=1600&q=80"
                  : "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80"
              }
              alt="Auth Background"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </motion.div>
        </AnimatePresence>

        {/* Form Section */}
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ x: isLogin ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLogin ? -100 : 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-neutral-900/80 backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md space-y-6"
              >
                <h2 className="text-4xl font-bold text-center">Welcome Back</h2>
                <p className="text-center text-neutral-400">
                  Login to your account
                </p>

                <form className="space-y-5 mt-6" onSubmit={handleLogin}>
                  <FloatingInput label="Email" type="email" name="email" />
                  <FloatingInput label="Password" type="password" name="password" />

                  <div className="flex justify-between text-sm text-neutral-400">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="accent-gray-600" />
                      Remember me
                    </label>
                    <a href="#" className="hover:text-white transition">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-semibold text-white transition disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="text-center text-sm text-neutral-400">
                  Don’t have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-white hover:underline"
                  >
                    Sign up
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md space-y-6"
              >
                <h2 className="text-4xl font-bold text-center">
                  Create Account
                </h2>
                <p className="text-center text-neutral-400">
                  Sign up to get started
                </p>

                <form className="space-y-5 mt-6" onSubmit={handleSignup}>
                  <FloatingInput label="Full Name" type="text" name="name" />
                  <FloatingInput label="Email" type="email" name="email" />
                  <FloatingInput label="Password" type="password" name="password" />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-semibold text-white transition disabled:opacity-50"
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </button>
                </form>

                <div className="text-center text-sm text-neutral-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-white hover:underline"
                  >
                    Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* Floating Input Component */
function FloatingInput({ label, type, name }) {
  return (
    <div className="relative group">
      <input
        type={type}
        name={name}
        required
        placeholder=" "
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 pt-5 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-neutral-600 peer transition-all"
      />
      <label className="absolute left-4 top-3.5 text-neutral-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-neutral-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-300">
        {label}
      </label>
    </div>
  );
}
