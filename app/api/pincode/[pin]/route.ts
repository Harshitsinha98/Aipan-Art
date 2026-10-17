import { NextResponse } from "next/server";

/** India Post lookup so the shopper only types a pincode; city & state fill in. */
export async function GET(_req: Request, { params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  if (!/^[1-9]\d{5}$/.test(pin)) return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    const po = data?.[0]?.PostOffice?.[0];
    if (!po) return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
    return NextResponse.json({ city: po.District as string, state: po.State as string });
  } catch {
    return NextResponse.json({ error: "Lookup unavailable" }, { status: 503 });
  }
}
