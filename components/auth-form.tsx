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
  const googleError = params.get("error");
  const [error, setError] = useState<string | null>(
    googleError
      ? googleError === "google-off"
        ? "Google sign-in isn't set up yet. Use email & password for now."
        : googleError === "google-cancelled"
          ? "Google sign-in was cancelled."
          : "Google sign-in didn't work. Please try again or use email & password."
      : null,
  );
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

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

        <a
          href={`/api/auth/google?next=${encodeURIComponent(safeNext)}`}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-kajal/15 bg-white py-3.5 text-[15px] font-semibold text-kajal transition hover:border-kajal/30 hover:shadow-sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
          </svg>
          Continue with Google
        </a>

        <div className="my-6 flex items-center gap-4 text-[12px] uppercase tracking-[0.18em] text-kajal-300">
          <span className="h-px flex-1 bg-kajal/10" /> or {mode === "login" ? "sign in" : "sign up"} with email <span className="h-px flex-1 bg-kajal/10" />
        </div>

        <form onSubmit={submit} className="space-y-4">
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
