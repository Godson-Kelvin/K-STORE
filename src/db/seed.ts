import "dotenv/config";
import { db } from "./index";
import { users, categories, products, reviews, cartItems, orderItems, orders, wishlistItems } from "./schema";
import { hashPassword } from "../lib/auth";
import { slugify } from "../lib/utils";

const px = (id: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&w=900&h=900`;

const catDefs = [
  { name: "Audio", slug: "audio", description: "Headphones, earbuds and sound for every moment.", image: px(30981655) },
  { name: "Wearables", slug: "wearables", description: "Smartwatches and fitness bands that keep up.", image: px(3184451) },
  { name: "Computing", slug: "computing", description: "Laptops, keyboards and desktop essentials.", image: px(3184463) },
  { name: "Photography", slug: "photography", description: "Cameras and gear for creators.", image: px(3944802) },
  { name: "Fashion", slug: "fashion", description: "Sneakers, shades and everyday style.", image: px(28645957) },
  { name: "Beauty", slug: "beauty", description: "Fragrance and skincare rituals.", image: px(4202329) },
  { name: "Home", slug: "home", description: "Minimal decor for modern living.", image: px(34022883) },
];

type SeedProduct = {
  name: string;
  price: number;
  compareAtPrice?: number;
  imgId: number;
  ext?: string;
  stock: number;
  featured?: boolean;
  description: string;
  galleryIds?: number[];
};

const productDefs: Record<string, SeedProduct[]> = {
  audio: [
    {
      name: "Pulse Buds Pro",
      price: 142999,
      compareAtPrice: 175999,
      imgId: 30981655,
      stock: 42,
      featured: true,
      description:
        "Immersive active noise cancellation, spatial audio and a feather-light fit. Pulse Buds Pro deliver studio-grade sound with up to 36 hours of battery life in the case.",
      galleryIds: [30981655, 33307582, 10024624],
    },
    {
      name: "BassDrop Wireless Earbuds",
      price: 87999,
      compareAtPrice: 109999,
      imgId: 33797659,
      stock: 65,
      description:
        "Punchy bass, crystal-clear calls and instant pairing. BassDrop earbuds are built for all-day listening with IPX5 sweat resistance.",
      galleryIds: [33797659, 33022724, 6867258],
    },
    {
      name: "MonoBuds Studio ANC",
      price: 219999,
      compareAtPrice: 274999,
      imgId: 20573137,
      stock: 18,
      featured: true,
      description:
        "Reference-grade over-ear sound with adaptive ANC and plush memory-foam cushions. A studio in your pocket — minus the wires.",
      galleryIds: [20573137, 7812322, 10024624],
    },
    {
      name: "Violet Air Buds",
      price: 98999,
      imgId: 33022724,
      stock: 30,
      description:
        "A sleek, glossy finish and warm, detailed sound. Violet Air Buds pair beautifully with your phone and your aesthetic.",
      galleryIds: [33022724, 33307582, 33797659],
    },
  ],
  wearables: [
    {
      name: "Orbit Smartwatch S2",
      price: 274999,
      compareAtPrice: 329999,
      imgId: 3184451,
      stock: 25,
      featured: true,
      description:
        "A gorgeous always-on display, advanced health sensors and 5-day battery. Orbit S2 tracks everything from workouts to sleep with clinical accuracy.",
      galleryIds: [3184451, 5237706, 6857202],
    },
    {
      name: "Chrono Watch SE",
      price: 208999,
      imgId: 6857202,
      stock: 40,
      description:
        "Timeless design meets smart convenience. Notifications, payments and fitness tracking in a case that looks as good with a suit as with sweatpants.",
      galleryIds: [6857202, 5237706, 3184451],
    },
    {
      name: "PulseFit Activity Band",
      price: 65999,
      imgId: 5237706,
      stock: 80,
      description:
        "Your daily companion for steps, heart rate and 20+ workout modes. Featherweight with a 14-day battery life.",
      galleryIds: [5237706, 6857202, 3184451],
    },
  ],
  computing: [
    {
      name: "AeroBook Air 14",
      price: 1099999,
      compareAtPrice: 1319999,
      imgId: 3184463,
      stock: 12,
      featured: true,
      description:
        "Ultra-thin, fanless and blazing fast. The AeroBook Air 14 pairs a stunning retina display with all-day battery in a 2.7lb chassis.",
      galleryIds: [3184463, 1181511, 5054351],
    },
    {
      name: "K-Key Mechanical Keyboard",
      price: 142999,
      imgId: 37605096,
      stock: 55,
      description:
        "Hot-swappable switches, gasket-mounted plate and gorgeous RGB. The K-Key is the last keyboard your desk will ever need.",
      galleryIds: [37605096, 3944802, 3184463],
    },
    {
      name: "SwiftBook M2",
      price: 1429999,
      imgId: 1181511,
      stock: 9,
      description:
        "Pro-grade performance for creators and developers. The SwiftBook M2 chews through 4K edits and heavy compiles without breaking a sweat.",
      galleryIds: [1181511, 3184463, 5054351],
    },
    {
      name: "WorkPad Ultra Laptop",
      price: 934999,
      imgId: 5054351,
      stock: 15,
      description:
        "A dependable workhorse with a vibrant 15.6\" display, comfortable keyboard and a full suite of ports. Built for getting things done.",
      galleryIds: [5054351, 1181511, 3184463],
    },
  ],
  photography: [
    {
      name: "FocusCam X100 Camera",
      price: 824999,
      compareAtPrice: 989999,
      imgId: 3944802,
      stock: 14,
      featured: true,
      description:
        "A 26MP APS-C sensor, 4K video and a classic rangefinder look. FocusCam X100 is the camera you'll never want to put down.",
      galleryIds: [3944802, 37605096, 3184463],
    },
  ],
  fashion: [
    {
      name: "CloudStep Runner",
      price: 131999,
      compareAtPrice: 164999,
      imgId: 28645957,
      stock: 60,
      featured: true,
      description:
        "Featherlight foam, breathable knit and a bold silhouette. CloudStep Runners make every mile feel like the first.",
      galleryIds: [28645957, 13807630, 11324518],
    },
    {
      name: "Streetline Sneakers",
      price: 105599,
      imgId: 13807630,
      stock: 48,
      description:
        "Clean lines, premium suede and everyday comfort. The Streetline is the quiet flex your rotation has been missing.",
      galleryIds: [13807630, 28645957, 8551780],
    },
    {
      name: "Aviator Classic Shades",
      price: 164999,
      imgId: 20689005,
      ext: "png",
      stock: 33,
      description:
        "Polarized lenses, featherweight titanium frames and 100% UV protection. Timeless aviators with a modern edge.",
      galleryIds: [20689005, 28645956, 28645957],
    },
    {
      name: "Metro Tote Bag",
      price: 98999,
      imgId: 28645956,
      stock: 27,
      description:
        "Full-grain leather, a padded laptop sleeve and room for everything else. The Metro tote goes from office to weekend effortlessly.",
      galleryIds: [28645956, 20689005, 28645957],
    },
    {
      name: "Court Classic Sneakers",
      price: 94599,
      imgId: 1424537,
      stock: 44,
      description:
        "A retro court silhouette with a cushioned sole and premium colorways. Court Classics are made to be worn in.",
      galleryIds: [1424537, 8551780, 13807630],
    },
    {
      name: "Onyx Glide Sneakers",
      price: 153999,
      imgId: 8551780,
      stock: 22,
      description:
        "Sleek all-black styling with responsive cushioning. Onyx Glides disappear on your feet — until people ask where they're from.",
      galleryIds: [8551780, 1424537, 28645957],
    },
  ],
  beauty: [
    {
      name: "Lumière Parfum",
      price: 133099,
      compareAtPrice: 166099,
      imgId: 4202329,
      stock: 36,
      featured: true,
      description:
        "Notes of bergamot, jasmine and warm amber. Lumière is an unforgettable signature scent that lingers just long enough.",
      galleryIds: [4202329, 4202321, 6794166],
    },
    {
      name: "Aura Skincare Ritual",
      price: 71499,
      imgId: 4202321,
      stock: 70,
      description:
        "A three-step ritual with clean, botanical formulas. Cleanser, serum and moisturizer that leave skin glowing.",
      galleryIds: [4202321, 4202329, 6794166],
    },
  ],
  home: [
    {
      name: "Serene Vase Trio",
      price: 64899,
      imgId: 34022883,
      stock: 40,
      description:
        "Three hand-finished matte ceramic vases that look stunning alone or together. Minimal forms, maximum presence.",
      galleryIds: [34022883, 14608172, 14608171],
    },
    {
      name: "Moderna Ceramic Vases",
      price: 80299,
      imgId: 14608172,
      stock: 25,
      description:
        "Bold, sculptural vases in a clean white finish. The Moderna set turns a corner shelf into a gallery.",
      galleryIds: [14608172, 34022883, 14608171],
    },
    {
      name: "Bloom Vase Set",
      price: 73699,
      imgId: 14608171,
      stock: 31,
      description:
        "A trio of organic curves inspired by petals in bloom. Each vase is unique — just like your flowers.",
      galleryIds: [14608171, 14608172, 34022883],
    },
    {
      name: "Cobalt Porcelain Vase",
      price: 50599,
      imgId: 16001092,
      stock: 50,
      description:
        "A striking cobalt glaze on classic porcelain. One statement piece that anchors an entire room.",
      galleryIds: [16001092, 34022883, 14608172],
    },
  ],
};

async function main() {
  console.log("Clearing existing data...");
  await db.delete(wishlistItems);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(reviews);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(users);

  console.log("Seeding categories & products...");
  const catMap = new Map<string, number>();
  for (const c of catDefs) {
    const [row] = await db
      .insert(categories)
      .values({ name: c.name, slug: c.slug, description: c.description, image: c.image })
      .returning({ id: categories.id });
    catMap.set(c.slug, row.id);
  }

  const productIdBySlug = new Map<string, number>();
  for (const [slug, defs] of Object.entries(productDefs)) {
    const categoryId = catMap.get(slug)!;
    for (const p of defs) {
      const gallery = (p.galleryIds ?? [p.imgId]).map((id, i) => px(id, i === 0 ? p.ext ?? "jpeg" : "jpeg"));
      const [row] = await db
        .insert(products)
        .values({
          name: p.name,
          slug: slugify(p.name),
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          image: px(p.imgId, p.ext ?? "jpeg"),
          gallery,
          categoryId,
          stock: p.stock,
          featured: p.featured ?? false,
        })
        .returning({ id: products.id });
      productIdBySlug.set(row.id ? slugify(p.name) : "", row.id);
    }
  }

  console.log("Seeding users...");
  const [admin] = await db
    .insert(users)
    .values({
      name: "K-Store Admin",
      email: "admin@kstore.com",
      passwordHash: hashPassword("admin123"),
      role: "admin",
    })
    .returning({ id: users.id });

  const [demo] = await db
    .insert(users)
    .values({
      name: "Alex Morgan",
      email: "demo@kstore.com",
      passwordHash: hashPassword("demo123"),
      role: "customer",
    })
    .returning({ id: users.id });

  console.log("Seeding reviews...");
  const reviewSeeds: Array<[string, number, string, string]> = [
    ["pulse-buds-pro", 5, "Best earbuds I've owned", "The noise cancellation is unreal for the price. Battery easily lasts a full work week."],
    ["pulse-buds-pro", 4, "Great sound, comfy fit", "Sound quality is superb. Case is a little bigger than my last pair but worth it."],
    ["orbit-smartwatch-s2", 5, "Health tracking is next level", "Sleep and workout tracking feel accurate, and the display is gorgeous in sunlight."],
    ["orbit-smartwatch-s2", 4, "Love it", "Battery life is great. Would love more watch faces out of the box."],
    ["cloudstep-runner", 5, "Feels like walking on clouds", "Ran a half marathon in these with zero break-in period."],
    ["cloudstep-runner", 5, "Perfect everyday shoe", "Style and comfort in one. I get compliments everywhere."],
    ["focuscam-x100-camera", 5, "Photographer's dream", "The image quality straight out of camera is stunning. Manual controls are a joy."],
    ["k-key-mechanical-keyboard", 5, "Typing heaven", "The thock is real. Hot-swap means I can customize everything."],
    ["lumire-parfum", 4, "Signature scent found", "Long-lasting and unique. A little pricey but you can smell the quality."],
  ];
  for (const [slug, rating, title, comment] of reviewSeeds) {
    const pid = productIdBySlug.get(slug);
    if (!pid) continue;
    await db.insert(reviews).values({
      productId: pid,
      userId: demo.id,
      userName: "Alex Morgan",
      rating,
      title,
      comment,
    });
  }

  // Update denormalized rating aggregates
  const allProducts = await db.select({ id: products.id }).from(products);
  for (const p of allProducts) {
    const result = await db.execute<{ avg: number; cnt: number }>(
      sql`SELECT COALESCE(AVG(rating),0)::float8 AS avg, COUNT(*)::int AS cnt FROM reviews WHERE product_id = ${p.id}`
    );
    const agg = result.rows[0];
    await db
      .update(products)
      .set({ rating: Math.round(agg.avg * 10) / 10, ratingCount: agg.cnt })
      .where(eq(products.id, p.id));
  }

  console.log("Seed complete!");
  console.log("  Admin login: admin@kstore.com / admin123");
  console.log("  Demo login:  demo@kstore.com / demo123");
  process.exit(0);
}

import { eq, sql } from "drizzle-orm";
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
