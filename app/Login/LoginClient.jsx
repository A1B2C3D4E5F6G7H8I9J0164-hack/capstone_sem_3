"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import FloatingInput from "./FloatingInput";

function ElegantShape({
  className = "",
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={`absolute inset-0 rounded-full 
          bg-gradient-to-r to-transparent ${gradient} 
          backdrop-blur-[2px] border-2 border-white/[0.15]
          shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]
          after:absolute after:inset-0 after:rounded-full 
          after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]`}
        />
      </motion.div>
    </motion.div>
  );
}

export default function LoginClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();


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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden blur-xl">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      {/* Overlay fade effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

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

      <div className="relative flex w-[90%] max-w-5xl overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-neutral-800 bg-neutral-950/90">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login-img" : "signup-img"}
            initial={{ x: isLogin ? "-100%" : "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLogin ? "100%" : "-100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hidden md:block w-1/2 h-[700px] relative"
          >
            <Image
              src={
                isLogin
                  ? "https://i0.wp.com/picjumbo.com/wp-content/uploads/magnificent-futuristic-dark-architectural-background-free-photo.jpeg?quality=70&w=2210"
                  : "https://plus.unsplash.com/premium_photo-1661407772941-c5a2a5c9595b?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGFyayUyMG9mZmljZXxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000"
              }
              alt={isLogin ? "Futuristic dark architectural background" : "Dark office interior"}
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
          </motion.div>
        </AnimatePresence>

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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-semibold text-white transition disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

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
