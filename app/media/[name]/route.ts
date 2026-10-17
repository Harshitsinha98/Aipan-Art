import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };
const DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|avif)$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(path.join(DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": MIME[name.split(".").pop()!],
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
