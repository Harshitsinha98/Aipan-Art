"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui";
import { ChowkiMandala } from "./motifs";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    router.replace(next.startsWith("/") && !next.startsWith("//") ? next : "/account");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8 sm:px-8 lg:grid-cols-2">
      <div className="grain relative hidden min-h-[560px] overflow-hidden rounded-[36px] bg-geru-600 lg:block">
        <ChowkiMandala className="absolute left-1/2 top-1/2 w-[520px] -translate-x-1/2 -translate-y-1/2 text-biswar/80" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-center py-10 lg:px-12">
        <h1 className="font-display text-5xl">{mode === "login" ? "Welcome back." : "Make yourself at home."}</h1>
        <p className="mt-3 text-kajal-400">
          {mode === "login"
            ? "Sign in to see your orders and check out faster."
            : "Save addresses, follow your orders as they're made, and leave a review."}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="label">Your name</span>
              <input name="name" required minLength={2} autoComplete="name" className="field" />
            </label>
          )}
          <label className="block">
            <span className="label">Email</span>
            <input name="email" type="email" required autoComplete="email" className="field" />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input name="password" type="password" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} className="field" />
          </label>
          {error && <p className="rounded-xl bg-geru-50 px-4 py-3 text-[14px] text-geru-700">{error}</p>}
          <Button variant="geru" className="w-full" disabled={busy}>
            {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-[14px] text-kajal-400">
          {mode === "login" ? (
            <>New here? <Link className="font-semibold text-kajal underline underline-offset-2" href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>
          ) : (
            <>Already have one? <Link className="font-semibold text-kajal underline underline-offset-2" href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></>
          )}
          <br />
          <span className="mt-2 block">Just want to buy? <Link href="/checkout" className="font-semibold text-kajal underline underline-offset-2">Check out as a guest</Link> — no account needed.</span>
        </p>
      </motion.div>
    </div>
  );
}
