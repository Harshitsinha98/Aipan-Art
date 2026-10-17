import type { Metadata, Viewport } from "next";
import { Young_Serif, Familjen_Grotesk, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { site } from "@/lib/site";

const display = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const sans = Familjen_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const deva = Tiro_Devanagari_Hindi({ subsets: ["devanagari"], weight: "400", variable: "--font-deva", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, type: "website", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#9B2D20" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${deva.variable}`}>
      <body>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
