import Link from "next/link";
import { ChowkiMandala, BelBorder, Pagla, Vasudhara } from "@/components/motifs";
import { Reveal, RiseText } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata = {
  title: "The craft",
  description: "What Aipan is, how it's drawn, and why our crochet sits beside it.",
};

const motifs = [
  { name: "Bindu", deva: "बिन्दु", text: "Every chowki begins with a single dot — the point the universe is said to come from and return to." },
  { name: "Shiv–Shakti", deva: "शिव-शक्ति", text: "Two triangles around the bindu, one pointing up and one down, drawn as a six-pointed star." },
  { name: "Lakshmi pagle", deva: "लक्ष्मी पग", text: "Small footprints walking in through the door at Diwali, so prosperity knows the way home." },
  { name: "Vasudhara", deva: "वसुधारा", text: "Vertical lines poured down the front of a step or a temple — a blessing of plenty." },
  { name: "Bel", deva: "बेल", text: "Creepers of dots and curls that close every border. No two hands draw them the same." },
];

export default function StoryPage() {
  return (
    <div>
      <section className="px-3 sm:px-6">
        <div className="grain relative mx-auto flex min-h-[78vh] max-w-[1500px] items-end overflow-hidden rounded-[28px] bg-geru-600 p-6 text-biswar sm:rounded-[40px] sm:p-14">
          <ChowkiMandala className="absolute -right-32 -top-20 w-[760px] text-biswar/50" />
          <div className="relative z-[2] max-w-3xl">
            <p className="font-deva text-3xl text-haldi">ऐपण · अर्पण</p>
            <h1 className="mt-4 font-display text-mega">
              <RiseText text="An offering, drawn by hand." />
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-[1200px] gap-12 px-6 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="eyebrow text-geru-600">What it is</p>
          <Vasudhara className="mt-6 h-40 text-geru-600" lines={6} />
        </Reveal>
        <Reveal delay={0.1} className="space-y-6 font-display text-[24px] leading-[1.4] sm:text-[28px]">
          <p>
            Aipan is the ritual floor-and-wall art of Kumaon, in Uttarakhand. The name is usually traced to <em>arpan</em> —
            an offering. It is believed to have taken shape around Almora and flourished in the time of the Chand kings.
          </p>
          <p className="text-kajal-400">
            It has always been women&apos;s work, passed from mother to daughter: drawn before weddings, naming
            ceremonies, pujas and every festival, and today recognised with a Geographical Indication tag.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto mt-24 max-w-[1300px] px-6 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Geru", "The base. Red-ochre clay, washed onto the floor, a wooden chowki or a steel thali, and left to dry matte."],
            ["Biswar", "The line. Rice soaked overnight and ground into a white paste. Nothing else is used for the white."],
            ["Three fingers", "The tool. Lines are drawn with the last three fingers of the right hand — freehand, no stencil."],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className={i === 1 ? "md:mt-16" : ""}>
              <div className={`rounded-[28px] p-8 ${i === 0 ? "bg-geru-600 text-biswar" : i === 1 ? "bg-white text-kajal" : "bg-kajal text-biswar"}`}>
                <p className="font-display text-5xl">{t}</p>
                <p className="mt-4 leading-relaxed opacity-80">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-[1200px] px-6 sm:px-8">
        <h2 className="font-display text-huge">A small vocabulary</h2>
        <ul className="mt-10 divide-y divide-kajal/10 border-y border-kajal/10">
          {motifs.map((m, i) => (
            <Reveal as="li" key={m.name} delay={i * 0.05} className="grid gap-2 py-6 sm:grid-cols-[220px_140px_1fr] sm:items-baseline">
              <span className="font-display text-3xl">{m.name}</span>
              <span className="font-deva text-xl text-geru-600">{m.deva}</span>
              <span className="text-kajal-600">{m.text}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-28 max-w-[1200px] px-6 sm:px-8">
        <div className="rib grid gap-8 rounded-[36px] p-8 text-biswar sm:p-14 lg:grid-cols-2" style={{ ["--swatch" as string]: "#1E3A2C" }}>
          <div>
            <p className="font-deva text-2xl text-haldi">क्रोशिया</p>
            <h2 className="mt-2 font-display text-5xl">And the crochet?</h2>
          </div>
          <p className="text-[17px] leading-relaxed text-biswar/85">
            Rice paste won&apos;t dry in a Kumaoni winter. So when the likhai pauses, the hook comes out — rib-stitch
            beanies for the walk up to the temple, long scarves, granny-square totes and the little charms that end up on
            every bag. Same hands, same patience, softer material.
          </p>
        </div>
      </section>

      <section id="care" className="mx-auto mt-28 max-w-[1200px] scroll-mt-28 px-6 sm:px-8">
        <BelBorder className="text-geru-600/40" id="care-bel" />
        <div className="grid gap-10 py-14 md:grid-cols-3">
          <div>
            <h3 className="font-display text-3xl">Shipping</h3>
            <p className="mt-3 text-kajal-600">
              Ready pieces leave in 2–4 days; made-to-order pieces after they&apos;re finished (the product page tells you how long).
              Free over ₹{site.freeShippingAt}, otherwise ₹{site.shippingFee} anywhere in India.
            </p>
          </div>
          <div>
            <h3 className="font-display text-3xl">Returns</h3>
            <p className="mt-3 text-kajal-600">
              If something arrives damaged, write within 48 hours with a photo and we&apos;ll replace or refund it.
              Personalised and made-to-order pieces can&apos;t be returned otherwise.
            </p>
          </div>
          <div>
            <h3 className="font-display text-3xl">Care</h3>
            <p className="mt-3 text-kajal-600">
              Aipan: keep dry, wipe with a soft cloth. Crochet: hand-wash cold, dry flat in the shade — never wring.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Pagla className="h-8 text-geru-600" flip />
          <Link href="/shop" className="rounded-full bg-kajal px-6 py-3 font-semibold text-biswar">See what&apos;s on the table</Link>
        </div>
      </section>
    </div>
  );
}
