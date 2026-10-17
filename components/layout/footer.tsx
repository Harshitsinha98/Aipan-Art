"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram } from "lucide-react";
import { site } from "@/lib/site";
import { BelBorder, Vasudhara } from "../motifs";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="relative mt-24 bg-geru-600 text-biswar">
      <BelBorder className="absolute -top-4 text-geru-600" id="footer-bel" />
      <div className="grain">
        <div className="relative z-[2] mx-auto max-w-[1400px] px-4 pb-10 pt-20 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <p className="font-display text-[clamp(2.4rem,4.2vw,3.8rem)] leading-[0.98] tracking-[-0.02em]">
                Made <em className="font-display not-italic text-haldi">slowly.</em>
                <br />
                Sent with care.
              </p>
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-biswar/75">{site.description}</p>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-biswar px-4 py-2 text-sm font-semibold text-geru-700">
                <Instagram className="h-4 w-4" /> {site.instagramHandle}
              </a>
            </div>
            <FooterCol title="Shop" links={[["Aipan · Likhai", "/shop/aipan"], ["Crochet · Hook", "/shop/crochet"], ["Everything", "/shop"], ["Gift cards — soon", "/shop"]]} />
            <FooterCol title="Help" links={[["Track an order", "/track"], ["My account", "/account"], ["Shipping & returns", "/story#care"], ["Write to us", `mailto:${site.email}`]]} />
            <div className="hidden justify-end lg:flex">
              <Vasudhara className="h-48 text-biswar/80" lines={9} />
            </div>
          </div>
          <div className="mt-20 flex flex-col justify-between gap-4 border-t border-biswar/15 pt-6 text-[12px] text-biswar/60 sm:flex-row">
            <p>© {new Date().getFullYear()} {site.name} · {site.location}</p>
            <p className="font-deva text-[14px] text-biswar/70">हाथ से बना, दिल से भेजा</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow text-biswar/50">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="link-underline text-[15px]">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
