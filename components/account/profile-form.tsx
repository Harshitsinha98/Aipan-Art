"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui";

export function ProfileForm({ user }: { user: { name: string; email: string; phone: string } }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json();
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: "Saved." } : { ok: false, text: data.error });
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <label className="block"><span className="label">Name</span><input name="name" defaultValue={user.name} className="field" required /></label>
      <label className="block"><span className="label">Email</span><input value={user.email} disabled className="field opacity-60" /></label>
      <label className="block"><span className="label">Mobile</span><input name="phone" defaultValue={user.phone} className="field" inputMode="numeric" /></label>
      <fieldset className="rounded-[24px] bg-white/50 p-5">
        <legend className="px-2 text-[13px] font-semibold">Change password (optional)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="currentPassword" type="password" placeholder="Current password" className="field" autoComplete="current-password" />
          <input name="newPassword" type="password" placeholder="New password" className="field" autoComplete="new-password" />
        </div>
      </fieldset>
      {msg && <p className={msg.ok ? "text-pine" : "text-geru-700"}>{msg.text}</p>}
      <Button variant="ink" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
