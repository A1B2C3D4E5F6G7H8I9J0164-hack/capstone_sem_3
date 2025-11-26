"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FloatingInput from "./FloatingInput";

export default function LoginClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // OAuth redirect handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const token = searchParams?.get("token");
      const success = searchParams?.get("success");
      const error = searchParams?.get("error");

      if (token && success === "true") {
        localStorage.setItem("token", token);
        router.push("/Dashboard");
      } else if (error) {
        setErrorPopup("OAuth authentication failed. Please try again.");
        setTimeout(() => setErrorPopup(""), 3000);
        router.replace("/Login");
      }
    } catch (err) {
      console.error("Error reading search params:", err);
    }
  }, [searchParams, router]);

  const handleGoogleAuth = () => {
    window.location.href =
      "https://capstone-backend-3-jthr.onrender.com/api/auth/google";
  };

  // Email login
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(
        "https://capstone-backend-3-jthr.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/Dashboard");
      } else {
        setErrorPopup(data.message || "Invalid credentials!");
        setTimeout(() => setErrorPopup(""), 3000);
      }
    } catch (err) {
      setErrorPopup("Server error. Try again later!");
      setTimeout(() => setErrorPopup(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  // Signup
  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(
        "https://capstone-backend-3-jthr.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setIsLogin(true);
      } else {
        setErrorPopup(data.message || "Signup failed!");
        setTimeout(() => setErrorPopup(""), 3000);
      }
    } catch (err) {
      setErrorPopup("Server error. Try again later!");
      setTimeout(() => setErrorPopup(""), 3000);
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
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      {/* Error Popup */}
      <AnimatePresence>
        {errorPopup && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            {errorPopup}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CARD */}
      <div className="relative flex w-[90%] max-w-5xl overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-neutral-800 bg-neutral-950/90">
        
        {/* image section */}
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
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </motion.div>
        </AnimatePresence>

        {/* FORM SECTION */}
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ x: isLogin ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: isLogin ? -100 : 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-neutral-900/80 backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">

            {/* LOGIN */}
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-semibold text-white transition disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                {/* OAuth */}
                <button
                  onClick={handleGoogleAuth}
                  className="w-full py-3 rounded-lg bg-white text-gray-900 mt-3 font-semibold"
                >
                  Continue with Google
                </button>

                <p className="text-center text-neutral-400 mt-4">
                  Don’t have an account?
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-white ml-2 underline"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.div>
            ) : (
              /* SIGNUP */
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md space-y-6"
              >
                <h2 className="text-4xl font-bold text-center">Create Account</h2>

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

                <button
                  onClick={handleGoogleAuth}
                  className="w-full py-3 rounded-lg bg-white text-gray-900 mt-3 font-semibold"
                >
                  Continue with Google
                </button>

                <p className="text-center text-neutral-400 mt-4">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-white underline"
                  >
                    Login
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
