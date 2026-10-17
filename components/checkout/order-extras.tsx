"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChowkiMandala } from "../motifs";
import { Button } from "../ui";

export function OrderCelebration({ name }: { name: string }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center bg-geru-600 text-biswar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          onClick={() => setShow(false)}
        >
          <ChowkiMandala className="w-[min(70vw,420px)] text-biswar/90" />
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="mt-8 font-deva text-4xl text-haldi">
            शुभ हो
          </motion.p>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4 }} className="mt-2 font-display text-3xl">
            Thank you, {name}. It&apos;s yours.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ClaimAccount({ orderNumber, token, email }: { orderNumber: string; token: string; email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("busy");
    const res = await fetch("/api/auth/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderNumber, token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setState("idle");
      return;
    }
    setState("done");
    router.refresh();
  }

  if (state === "done") {
    return <div className="rounded-[28px] bg-pine p-6 text-biswar">Saved. You can find this order any time under <b>Account</b>.</div>;
  }
  return (
    <form onSubmit={submit} className="rounded-[28px] bg-haldi-200 p-6">
      <h2 className="font-display text-2xl">Save your details?</h2>
      <p className="mt-1 text-[14px] text-kajal-600">
        One password and next time checkout is two taps. Your account will use <b>{email}</b>.
      </p>
      <input type="password" className="field mt-4" placeholder="Choose a password (8+ characters)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="mt-2 text-[13px] text-geru-700">{error}</p>}
      <Button variant="ink" className="mt-3 w-full" disabled={state === "busy"}>
        {state === "busy" ? "Saving…" : "Create my account"}
      </Button>
    </form>
  );
}
