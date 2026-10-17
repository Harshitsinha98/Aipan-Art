export const site = {
  name: "Aipan Art",
  shortName: "Aipan",
  tagline: "Likhai & hook, made slowly in the Kumaon hills.",
  description:
    "Hand-drawn Kumaoni Aipan in geru and biswar, and hand-hooked crochet beanies, scarves and bags. Every piece is made by one pair of hands in Uttarakhand.",
  instagram: "https://www.instagram.com/roam_and_hook",
  instagramHandle: "@roam_and_hook",
  email: "hello@aipanart.in",
  whatsapp: "", // e.g. "919876543210" — leave empty to hide the WhatsApp button
  location: "Almora · Uttarakhand",
  /** Home-page letter. Replace with the maker's own words. */
  makerNote: [
    "Every Diwali the doorstep gets a row of little feet walking inwards, drawn in rice paste, so Lakshmi knows the way in.",
    "I still draw them by hand. And when the hills get too cold for the paste to dry, I pick up a hook and make the things I wear on our walks.",
  ],
  /** Commerce rules (rupees). Change here, the whole site follows. */
  freeShippingAt: 999,
  shippingFee: 79,
  giftWrapFee: 49,
};

export const worlds = {
  AIPAN: {
    key: "AIPAN",
    slug: "aipan",
    name: "Likhai",
    deva: "ऐपण",
    blurb: "Rice-paste lines on red ochre — thalis, chowkis, diyas and wall pieces drawn freehand with three fingers.",
  },
  CROCHET: {
    key: "CROCHET",
    slug: "crochet",
    name: "Hook",
    deva: "क्रोशिया",
    blurb: "Beanies, scarves, totes and little charms, hooked stitch by stitch through the long mountain winters.",
  },
} as const;

export type WorldKey = keyof typeof worlds;

export function worldFromSlug(slug?: string | null): WorldKey | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  if (s === "aipan") return "AIPAN";
  if (s === "crochet") return "CROCHET";
  return undefined;
}
