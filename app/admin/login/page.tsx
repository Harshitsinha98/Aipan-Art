"use client";

import { useActionState } from "react";
import { adminLogin } from "@/lib/admin-actions";
import { ChowkiMandala } from "@/components/motifs";
import { Logo } from "@/components/layout/logo";

export default function AdminLogin() {
  const [state, action, pending] = useActionState(adminLogin, {});
  return (
    <div className="flex min-h-screen items-center justify-center bg-kajal p-4">
      <ChowkiMandala className="pointer-events-none fixed -left-40 -top-40 w-[600px] text-biswar/10" />
      <form action={action} className="relative w-full max-w-sm rounded-[28px] bg-biswar p-8">
        <Logo />
        <h1 className="mt-6 font-display text-3xl">Owner&apos;s room</h1>
        <p className="mt-1 text-[14px] text-kajal-400">Products, stock, orders and payments.</p>
        <div className="mt-6 space-y-3">
          <input name="email" type="email" placeholder="Email" required className="field" autoComplete="username" />
          <input name="password" type="password" placeholder="Password" required className="field" autoComplete="current-password" />
        </div>
        {state?.error && <p className="mt-3 text-[13px] text-geru-700">{state.error}</p>}
        <button disabled={pending} className="mt-5 w-full rounded-full bg-geru-600 py-3.5 font-semibold text-biswar disabled:opacity-60">
          {pending ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
