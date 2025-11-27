"use client";
import React from "react";
import HeroGeometric from "./components/hero";

const Page = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030303]">
      <HeroGeometric
        badge="LearnSphere – AI Study Companion"
        title1="Simplify Learning with Intelligence"
        title2=""
      />
    </div>
  );
};

export default Page;
