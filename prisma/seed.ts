import { PrismaClient, type World } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories: { name: string; slug: string; world: World; sortOrder: number; description: string }[] = [
  { name: "Puja Thali", slug: "puja-thali", world: "AIPAN", sortOrder: 1, description: "Steel and brass thalis with a geru base." },
  { name: "Chowki", slug: "chowki", world: "AIPAN", sortOrder: 2, description: "Low wooden platforms for idols and rituals." },
  { name: "Wall Art", slug: "wall-art", world: "AIPAN", sortOrder: 3, description: "Framed Aipan on cloth and board." },
  { name: "Nameplates", slug: "nameplates", world: "AIPAN", sortOrder: 4, description: "Personalised, for the front door." },
  { name: "Diyas & Decor", slug: "diyas-decor", world: "AIPAN", sortOrder: 5, description: "Small things for festivals and tables." },
  { name: "Beanies", slug: "beanies", world: "CROCHET", sortOrder: 1, description: "Rib-stitch, double brim, warm." },
  { name: "Scarves", slug: "scarves", world: "CROCHET", sortOrder: 2, description: "Long, soft and hand-hooked." },
  { name: "Bags & Totes", slug: "bags", world: "CROCHET", sortOrder: 3, description: "Granny squares, slings and totes." },
  { name: "Hats", slug: "hats", world: "CROCHET", sortOrder: 4, description: "Bucket hats and more." },
  { name: "Charms", slug: "charms", world: "CROCHET", sortOrder: 5, description: "Keychains and bag charms." },
];

type Seed = {
  cat: string;
  world: World;
  name: string;
  slug: string;
  sku: string;
  tagline: string;
  description: string;
  makerNote?: string;
  materials?: string;
  care?: string;
  dimensions?: string;
  price: number;
  compareAtPrice?: number;
  swatch: string;
  stock?: number;
  madeToOrder?: boolean;
  leadTimeDays?: number;
  customizable?: boolean;
  customizationLabel?: string;
  featured?: boolean;
  variants?: { label: string; colorHex: string; stock: number; price?: number }[];
};

const crochetCare = "Hand-wash in cold water with mild soap. Press out water in a towel, dry flat in the shade. Never wring or tumble dry.";
const aipanCare = "Keep dry. Dust with a soft dry cloth. Hand-painted with natural geru and rice-paste-white acrylic for longevity.";

const products: Seed[] = [
  // ---------------- CROCHET ----------------
  {
    cat: "beanies", world: "CROCHET", name: "Himal Rib Beanie", slug: "himal-rib-beanie", sku: "CR-BN-HIMAL",
    tagline: "Variegated blue-grey, double brim", featured: true, price: 899, compareAtPrice: 1099, swatch: "#8EA8C3",
    description: "A close-fitting rib-stitch beanie in a blue-grey yarn that shifts colour as it goes round — no two come out striped the same way. The folded brim doubles over your ears for the cold walks.",
    makerNote: "I made the first one for a December walk to Kasar Devi. It hasn't come off since.",
    materials: "Acrylic-wool blend yarn", dimensions: "Stretches to fit 54–60 cm head", care: crochetCare,
    variants: [
      { label: "Himal blue-grey", colorHex: "#8EA8C3", stock: 4 },
      { label: "Slate", colorHex: "#5E6B78", stock: 2 },
    ],
  },
  {
    cat: "beanies", world: "CROCHET", name: "Deodar Stripe Beanie", slug: "deodar-stripe-beanie", sku: "CR-BN-DEODAR",
    tagline: "Forest green with a bold cream stripe", featured: true, price: 949, swatch: "#1E3A2C",
    description: "Deep deodar green, broken by one bold cream stripe that runs over the crown. Thick rib, slouchy fit, warm enough for Munsiyari.",
    materials: "Acrylic yarn, extra-soft", dimensions: "Fits 54–60 cm head, slight slouch", care: crochetCare,
    variants: [
      { label: "Forest & cream", colorHex: "#1E3A2C", stock: 3 },
      { label: "Rust & cream", colorHex: "#A4482A", stock: 0 },
    ],
  },
  {
    cat: "scarves", world: "CROCHET", name: "Midnight Rib Scarf", slug: "midnight-rib-scarf", sku: "CR-SC-MIDNIGHT",
    tagline: "Navy, long, ribbed", price: 1299, swatch: "#1F2A4D", stock: 3,
    description: "A long navy scarf in a deep vertical rib. Wraps twice, tucks in neatly, and goes with everything you own.",
    materials: "Acrylic-wool blend", dimensions: "About 160 × 18 cm", care: crochetCare,
  },
  {
    cat: "scarves", world: "CROCHET", name: "Sindoor Long Scarf", slug: "sindoor-long-scarf", sku: "CR-SC-SINDOOR",
    tagline: "The red one", featured: true, price: 1399, swatch: "#C21E24", stock: 2,
    description: "Sindoor red, chunky and long enough to loop and still hang to your waist. Bright on a grey winter day.",
    makerNote: "The colour of the tika on Dussehra. It photographs like nothing else against the hills.",
    materials: "Chunky acrylic yarn", dimensions: "About 180 × 20 cm", care: crochetCare,
  },
  {
    cat: "bags", world: "CROCHET", name: "Dil Granny Tote", slug: "dil-granny-tote", sku: "CR-BG-DIL",
    tagline: "Red & cream hearts, granny squares", featured: true, price: 1799, swatch: "#B3242A", stock: 1,
    description: "Nine granny squares with a heart in each, alternating red and cream, joined into a roomy shoulder tote. Fits a notebook, a water bottle and a shawl.",
    materials: "Cotton-acrylic yarn, lined", dimensions: "About 34 × 32 cm, 60 cm strap", care: "Spot clean, or hand-wash cold and dry flat.",
  },
  {
    cat: "bags", world: "CROCHET", name: "Phool Sling Bag", slug: "phool-sling-bag", sku: "CR-BG-PHOOL",
    tagline: "Cream sling with a mauve daisy & flower charm", price: 1499, swatch: "#E9DFCC", stock: 2,
    description: "A small cream crossbody with an eight-petal mauve daisy on the front, wooden bead closure and a little 3-D flower hanging from the side.",
    materials: "Cotton yarn, wooden bead", dimensions: "About 20 × 20 cm, 120 cm strap", care: "Spot clean.",
  },
  {
    cat: "bags", world: "CROCHET", name: "Sunshine Tote", slug: "sunshine-tote", sku: "CR-BG-SUNSHINE",
    tagline: "Haldi-yellow tote with bee & daisy charms", featured: true, price: 1899, swatch: "#F2C230", stock: 1,
    description: "A sturdy, structured tote in t-shirt yarn the colour of turmeric, with a front pocket and a keyring of a bumble bee and two daisies.",
    materials: "Recycled t-shirt yarn", dimensions: "About 38 × 30 × 10 cm", care: "Spot clean, air dry.",
  },
  {
    cat: "hats", world: "CROCHET", name: "Granny Bucket Hat", slug: "granny-bucket-hat", sku: "CR-HT-BUCKET",
    tagline: "Lime & sky-blue flower squares", price: 1199, swatch: "#B7C64A", madeToOrder: true, leadTimeDays: 7,
    description: "A bucket hat built from granny-square flowers in lime, sky blue and a pop of yellow, finished with a soft wavy brim and optional chin ties.",
    makerNote: "Made to order — tell me your favourite colours in the gift note and I'll build the squares around them.",
    materials: "Cotton-acrylic yarn", dimensions: "Fits 54–58 cm head", care: crochetCare,
  },
  {
    cat: "charms", world: "CROCHET", name: "Panda Bag Charm", slug: "panda-bag-charm", sku: "CR-CH-PANDA",
    tagline: "A sleepy panda with an orange bow", price: 349, swatch: "#F1E7CF", stock: 8,
    description: "A flat, palm-sized panda face with rosy cheeks and a little orange flower, on a crochet loop for your keys or bag.",
    materials: "Cotton yarn", dimensions: "About 7 cm across", care: "Spot clean.",
  },

  // ---------------- AIPAN ----------------
  {
    cat: "puja-thali", world: "AIPAN", name: "Lakshmi Pagle Puja Thali", slug: "lakshmi-pagle-puja-thali", sku: "AP-TH-PAGLE",
    tagline: "Steel thali, geru base, footprints & lotus", featured: true, price: 549, compareAtPrice: 649, swatch: "#9B2D20", stock: 6,
    description: "A 10-inch steel puja thali washed in geru and drawn with Lakshmi's footprints walking towards a lotus in the centre, closed with a bel border.",
    makerNote: "The footprints always walk inwards — towards the diya, towards the home.",
    materials: "Stainless steel, geru, white paint", dimensions: "10 inch diameter", care: aipanCare,
  },
  {
    cat: "chowki", world: "AIPAN", name: "Kalash & Kamal Chowki", slug: "kalash-kamal-chowki", sku: "AP-CW-KALASH",
    tagline: "Wooden chowki for Diwali & griha pravesh", featured: true, price: 1199, swatch: "#8E2A1B", stock: 3,
    description: "A low wooden chowki painted with a kalash over an eight-petal kamal, the bindu and Shiv–Shakti star at its heart. Made to hold idols through every festival of the year.",
    materials: "Sheesham wood, geru, white paint", dimensions: "12 × 12 × 4 inch", care: aipanCare,
  },
  {
    cat: "wall-art", world: "AIPAN", name: "Shiv–Shakti Wall Frame", slug: "shiv-shakti-wall-frame", sku: "AP-WA-SHIVSHAKTI",
    tagline: "Hand-drawn mandala, 12 × 12 inch", price: 2499, swatch: "#7E2218", stock: 2,
    description: "The full chowki mandala — bindu, interlocked triangles, lotus ring, wave ring and a dotted border — drawn freehand on geru-washed board and framed in natural wood.",
    materials: "MDF board, geru, white paint, wood frame", dimensions: "12 × 12 inch framed", care: aipanCare,
  },
  {
    cat: "nameplates", world: "AIPAN", name: "Aipan Nameplate", slug: "aipan-nameplate", sku: "AP-NP-CUSTOM",
    tagline: "Your family name, with a bel border", featured: true, price: 1599, swatch: "#A8361F",
    madeToOrder: true, leadTimeDays: 10, customizable: true, customizationLabel: "Name for the nameplate",
    description: "A front-door nameplate in geru with your name hand-lettered in white and a bel creeper framing it. Weather-sealed for a covered doorway.",
    makerNote: "Type the name exactly as you'd like it — Hindi or English, I'll letter it by hand.",
    materials: "Pine board, geru, sealed white paint", dimensions: "12 × 6 inch", care: aipanCare,
  },
  {
    cat: "diyas-decor", world: "AIPAN", name: "Vasudhara Diya Set", slug: "vasudhara-diya-set", sku: "AP-DY-SET4",
    tagline: "Four clay diyas, poured lines", price: 399, swatch: "#B03E26", stock: 12,
    description: "Four clay diyas with geru wash and vasudhara lines running down their sides, ending in a dot each. Pretty enough to keep out after Diwali.",
    materials: "Terracotta, geru, white paint", dimensions: "3 inch each, set of 4", care: aipanCare,
  },
  {
    cat: "diyas-decor", world: "AIPAN", name: "Aipan Coaster Set", slug: "aipan-coaster-set", sku: "AP-CS-SET4",
    tagline: "Four coasters, four motifs", price: 649, swatch: "#9B2D20", stock: 5,
    description: "Four round MDF coasters, each with a different motif — bindu star, lotus, pagle and bel — sealed so your chai can sit on them.",
    materials: "MDF, geru, sealed white paint", dimensions: "4 inch each, set of 4", care: "Wipe with a damp cloth. Not dishwasher safe.",
  },
  {
    cat: "puja-thali", world: "AIPAN", name: "Karwa Chauth Thali Set", slug: "karwa-chauth-thali-set", sku: "AP-TH-KARWA",
    tagline: "Thali, karwa, diya, chalni & more — 7 pieces", price: 1799, swatch: "#8E2A1B", stock: 0, madeToOrder: true, leadTimeDays: 6,
    description: "A seven-piece set — thali, karwa, diya, chalni, glass, kumkum dibbi and a small lota — all washed in geru and drawn to match.",
    materials: "Steel, geru, white paint", dimensions: "Thali 12 inch", care: aipanCare,
  },
];

// Real product photos (in /public/products). New installs get them automatically.
const seedImages: Record<string, string[]> = {
  "himal-rib-beanie": ["/products/himal-rib-beanie-1.webp", "/products/himal-rib-beanie-2.webp"],
  "deodar-stripe-beanie": ["/products/deodar-stripe-beanie-1.webp"],
  "midnight-rib-scarf": ["/products/midnight-rib-scarf-1.webp"],
  "sindoor-long-scarf": ["/products/sindoor-long-scarf-1.webp"],
  "dil-granny-tote": ["/products/dil-granny-tote-1.webp"],
  "panda-bag-charm": ["/products/panda-bag-charm-1.webp"],
  "phool-sling-bag": ["/products/phool-sling-bag-1.webp"],
  "sunshine-tote": ["/products/sunshine-tote-1.webp"],
  "granny-bucket-hat": ["/products/granny-bucket-hat-1.webp"],
};

async function main() {
  const catIds = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
    catIds.set(c.slug, row.id);
  }

  for (const p of products) {
    const { cat, variants, ...rest } = p;
    const data = { ...rest, categoryId: catIds.get(cat)!, status: "ACTIVE" as const, images: seedImages[p.slug] ?? [], stock: rest.stock ?? 0 };
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue; // never clobber the owner's edits
    await prisma.product.create({
      data: {
        ...data,
        variants: variants
          ? { create: variants.map((v, i) => ({ ...v, sku: `${p.sku}-${i + 1}`, sortOrder: i })) }
          : undefined,
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "PEHLA10" },
    update: {},
    create: { code: "PEHLA10", type: "PERCENT", value: 10, maxDiscount: 300, description: "10% off a first order" },
  });
  await prisma.coupon.upsert({
    where: { code: "PAHAD150" },
    update: {},
    create: { code: "PAHAD150", type: "FLAT", value: 150, minimumOrder: 1499, description: "₹150 off orders above ₹1499" },
  });

  const email = (process.env.ADMIN_EMAIL ?? "owner@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-this-password";
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, name: "Owner", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });

  console.log(`Seeded ${categories.length} categories, ${products.length} products, 2 coupons. Owner login: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
