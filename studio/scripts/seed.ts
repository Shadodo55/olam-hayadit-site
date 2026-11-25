/**
 * Seeds the dataset: real taxonomy + store details, and SAMPLE brands/products.
 * Idempotent: fixed document IDs, so running it again updates instead of
 * duplicating. Run with:  npm run seed   (in /studio, after generating images
 * with `node scripts/generate-sample-images.mjs` from the repo root).
 *
 * Document IDs never contain "." (dotted IDs are private in public datasets).
 */
import { createReadStream, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";
import { API_VERSION } from "../lib/constants";
import {
  categories,
  finishes,
  materials,
  sampleBrands,
  sampleProducts,
  siteSettings,
} from "../seed/data";

const client = getCliClient({ apiVersion: API_VERSION });
// Generated files live outside the repo (and outside OneDrive, which
// struggles with thousands of synced files): ~/olam-hayadit-files.
const FILES =
  process.env.OLAM_FILES_DIR ?? join(homedir(), "olam-hayadit-files");
const IMAGES = join(FILES, "sample-content", "images");

const ref = (id: string) => ({ _type: "reference", _ref: id });
const key = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || "k";

const assetCache = new Map<string, string>();
async function uploadImage(file: string): Promise<string> {
  const cached = assetCache.get(file);
  if (cached) return cached;
  const path = join(IMAGES, file);
  if (!existsSync(path))
    throw new Error(
      `Missing ${path}. Run scripts/generate-sample-images.mjs first.`,
    );
  const asset = await client.assets.upload("image", createReadStream(path), {
    filename: file,
  });
  assetCache.set(file, asset._id);
  return asset._id;
}

/** Deterministic stock mix so the filters have something to show. */
function stockFor(index: number): string {
  if (index % 11 === 7) return "outOfStock";
  if (index % 7 === 3) return "specialOrder";
  if (index % 5 === 2) return "askUs";
  return "inStore";
}

async function main() {
  const tx = client.transaction();

  for (const f of finishes) {
    tx.createOrReplace({
      _id: `finish-${f.id}`,
      _type: "finish",
      name: f.name,
      slug: { _type: "slug", current: f.id },
      swatch: f.swatch,
      order: f.order,
    });
  }
  for (const m of materials) {
    tx.createOrReplace({
      _id: `material-${m.id}`,
      _type: "material",
      name: m.name,
      slug: { _type: "slug", current: m.id },
    });
  }
  // In-place preview per category (subcategories inherit; see SCENES).
  const sceneFor: Record<string, string> = {
    handles: "kitchenBar",
    "handles-kitchen-furniture": "kitchenBar",
    "handles-door": "doorLever",
    "handles-knobs": "kitchenKnob",
    "handles-fridge": "fridgeBar",
    "technical-legs": "furnitureLeg",
    bathroom: "towelBar",
    "home-decor": "wallHook",
  };
  for (const c of categories) {
    tx.createOrReplace({
      _id: `category-${c.id}`,
      _type: "category",
      title: c.title,
      slug: { _type: "slug", current: c.slug },
      allLabel: c.allLabel,
      order: c.order,
      filters: c.filters,
      ...(sceneFor[c.id] ? { scene: sceneFor[c.id] } : {}),
      ...(c.parent ? { parent: ref(`category-${c.parent}`) } : {}),
    });
  }
  for (const b of sampleBrands) {
    tx.createOrReplace({
      _id: b.id,
      _type: "brand",
      name: b.name,
      slug: { _type: "slug", current: b.id },
      description: b.description,
      isSample: true,
    });
  }
  // Create only if missing: never overwrite what the owner already edited.
  tx.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    ...siteSettings,
  });
  tx.createIfNotExists({
    _id: "homePage",
    _type: "homePage",
    headline: {
      he: "ידיות ופרזול. בוחרים ביד.",
      en: "Handles and hardware. Chosen by hand.",
    },
  });
  await tx.commit({ visibility: "async" });
  console.log("Taxonomy, brands and settings done.");

  let variantIndex = 0;
  const productTx = client.transaction();
  for (const p of sampleProducts) {
    const imageFiles = p.finishes
      .slice(0, 2)
      .map((f) => `sample-${p.shape}-${f}.png`);
    const images = [];
    for (const [i, file] of imageFiles.entries()) {
      const finishName = finishes.find((f) => f.id === p.finishes[i])!.name;
      images.push({
        _type: "altImage",
        _key: key(file),
        asset: ref(await uploadImage(file)),
        finish: ref(`finish-${p.finishes[i]}`),
        alt: {
          he: `תמונה לדוגמה: ${p.title.he} בגימור ${finishName.he}`,
          en: `Sample image: ${p.title.en}, ${finishName.en.toLowerCase()} finish`,
        },
      });
    }

    const variants = p.finishes.flatMap((finishId) =>
      p.sizes.map((size) => {
        const sizeCode = size.label.en
          ? size.label.en.replace(/[^0-9a-zA-Z]/g, "")
          : "STD";
        const sku = `DEMO-${p.code}-${sizeCode}-${finishId.slice(0, 2).toUpperCase()}`;
        return {
          _type: "variant",
          _key: key(sku),
          sku,
          finish: ref(`finish-${finishId}`),
          ...(size.label.he ? { sizeLabel: size.label } : {}),
          ...(size.holeToHoleMm ? { holeToHoleMm: size.holeToHoleMm } : {}),
          ...(size.lengthMm ? { lengthMm: size.lengthMm } : {}),
          price: Math.round(size.price * 100) / 100,
          stock: stockFor(variantIndex++),
        };
      }),
    );

    productTx.createOrReplace({
      _id: `sample-product-${p.code.toLowerCase()}`,
      _type: "product",
      title: p.title,
      sku: `DEMO-${p.code}`,
      slug: {
        _type: "slug",
        current:
          `demo-${p.code.toLowerCase()}-${p.title.en.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.replace(
            /-+$/,
            "",
          ),
      },
      categories: [{ ...ref(`category-${p.category}`), _key: key(p.category) }],
      // A hook among the bathroom's towel bars: shown on the wall instead.
      ...(p.shape === "hook" && p.category === "bathroom"
        ? { scene: "wallHook" }
        : {}),
      brand: ref(p.brand),
      material: ref(`material-${p.material}`),
      shortDescription: {
        he: "מוצר לדוגמה בלבד, להמחשת הקטלוג. המחיר והמלאי אינם אמיתיים.",
        en: "Sample product for illustration only. Price and stock are not real.",
      },
      images,
      variants,
      specs: (p.specs ?? []).map((s, i) => ({
        _type: "specRow",
        _key: `spec${i}`,
        ...s,
      })),
      isNew: Boolean(p.isNew),
      featured: Boolean(p.featured),
      isSample: true,
    });
  }
  await productTx.commit({ visibility: "async" });
  console.log(
    `${sampleProducts.length} sample products done (${variantIndex} variants, ${assetCache.size} images).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
