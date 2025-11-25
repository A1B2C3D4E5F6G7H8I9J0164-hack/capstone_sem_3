"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroGeometric from "./components/hero";
import { HoverBorderGradient } from "./components/heroButton";

const Page = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <HeroGeometric
        badge="LearnSphere – AI Study Companion"
        title1="Simplify Learning with Intelligence"
        title2=""
      />

      <motion.div
        className="absolute inset-0 flex justify-center items-center translate-y-60"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
      >
        <Link href="/Login">
        <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="bg-black text-black dark:text-white flex items-center space-x-2"
      >
        <span>Get Started</span>
      </HoverBorderGradient>
        </Link>
      </motion.div>
    </div>
  );
};

export default Page;
