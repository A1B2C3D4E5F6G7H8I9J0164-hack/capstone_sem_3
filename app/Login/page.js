"use client";

import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}

