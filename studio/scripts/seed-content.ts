/**
 * Seeds content pages: FAQ, "about" (with visible [להשלמה] gaps, never
 * invented facts), SAMPLE projects, a SAMPLE PDF catalog and a SAMPLE hero
 * video + poster for the home page. Idempotent (fixed IDs); existing FAQ /
 * about documents are NOT overwritten (the owner may have edited them).
 *
 *   node scripts/generate-sample-images.mjs && node scripts/generate-sample-media.mjs   (repo root)
 *   npm run seed:content                                                                 (studio/)
 */
import { createReadStream } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";
import { API_VERSION } from "../lib/constants";

const client = getCliClient({ apiVersion: API_VERSION });
// Generated files live outside the repo (and outside OneDrive, which
// struggles with thousands of synced files): ~/olam-hayadit-files.
const FILES =
  process.env.OLAM_FILES_DIR ?? join(homedir(), "olam-hayadit-files");
const SEED = join(FILES, "sample-content");
const ref = (id: string) => ({ _type: "reference", _ref: id });
let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;

type L = { he: string; en: string };
const block = (text: string, style: "normal" | "h2" = "normal") => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

async function upload(
  kind: "image" | "file",
  dir: string,
  file: string,
): Promise<string> {
  const asset = await client.assets.upload(
    kind,
    createReadStream(join(SEED, dir, file)),
    { filename: file },
  );
  return asset._id;
}

const altImage = (assetId: string, alt: L) => ({
  _type: "altImage",
  _key: key(),
  asset: ref(assetId),
  alt,
});

const faqs: { q: L; a: L }[] = [
  {
    q: { he: "אפשר להזמין דרך האתר?", en: "Can I order through the website?" },
    a: {
      he: "כרגע האתר הוא קטלוג בלבד, בלי הזמנה או תשלום. בכל עמוד מוצר יש כפתור לבדיקת זמינות בוואטסאפ, ואפשר גם להתקשר לחנות או להגיע לאולם התצוגה.",
      en: "For now the website is a catalog only, without ordering or payment. Every product page has a button to check availability on WhatsApp, and you can also call the store or visit the showroom.",
    },
  },
  {
    q: { he: "המחירים באתר כוללים מע״מ?", en: "Do the prices include VAT?" },
    a: {
      he: "כן. כל המחירים באתר כוללים מע״מ. מחירים ומלאי עשויים להשתנות, ואפשר לאשר אותם מול החנות לפני שמגיעים.",
      en: "Yes. All prices on the website include VAT. Prices and stock may change, and you can confirm them with the store before you come.",
    },
  },
  {
    q: {
      he: "איך יודעים איזו ידית תתאים לחורים הקיימים בארון?",
      en: "How do I know which handle fits the existing holes?",
    },
    a: {
      he: "מודדים את המרחק בין מרכזי שני חורי הבורג (מרכז-מרכז), במילימטרים. בעמוד ״איך מודדים ידית״ יש הסבר קצר, ובקטלוג אפשר לסנן לפי המידה הזו.",
      en: "Measure the distance between the centres of the two screw holes (hole-to-hole), in millimetres. The “How to measure a handle” page explains how, and the catalog can be filtered by this measurement.",
    },
  },
  {
    q: {
      he: "המלאי שמופיע באתר מעודכן?",
      en: "Is the stock shown on the website up to date?",
    },
    a: {
      he: "החנות מעדכנת את מצב המלאי באתר, אבל הוא עשוי להשתנות. לפני שמגיעים במיוחד, כדאי לבדוק זמינות בוואטסאפ או בטלפון.",
      en: "The store updates the stock status on the website, but it may change. Before making a special trip, check availability on WhatsApp or by phone.",
    },
  },
  {
    q: { he: "מה זה ״הרשימה שלי״?", en: "What is “My list”?" },
    a: {
      he: "רשימה שאפשר לשמור בה מוצרים כדי לתכנן את הביקור בחנות. אפשר לשלוח אותה אלינו בוואטסאפ או להדפיס אותה. הרשימה נשמרת רק במכשיר שלכם.",
      en: "A list where you can save products to plan your visit to the store. You can send it to us on WhatsApp or print it. It's saved only on your device.",
    },
  },
  {
    q: {
      he: "איפה החנות ומה שעות הפתיחה?",
      en: "Where is the store and when is it open?",
    },
    a: {
      he: "החנות נמצאת ביד חרוצים 16, באזור התעשייה תלפיות בירושלים. השעות המעודכנות מופיעות בעמוד ״ביקור בחנות״ ובתחתית כל עמוד באתר.",
      en: "The store is at 16 Yad Harutsim St. in the Talpiot industrial area, Jerusalem. Current opening hours are on the “Visit the store” page and at the bottom of every page.",
    },
  },
];

async function main() {
  // FAQ and about: create only if missing (the owner edits these).
  const tx = client.transaction();
  faqs.forEach((f, i) =>
    tx.createIfNotExists({
      _id: `faq-${i + 1}`,
      _type: "faq",
      question: f.q,
      answer: f.a,
      order: (i + 1) * 10,
    }),
  );
  tx.createIfNotExists({
    _id: "page-about",
    _type: "page",
    title: { he: "אודות", en: "About" },
    slug: { _type: "slug", current: "about" },
    body: {
      he: [
        block(
          "עולם הידית והפרזול הוא עסק משפחתי באזור התעשייה תלפיות בירושלים, עם אולם תצוגה לידיות, פרזול ואביזרי אמבטיה, ללקוחות פרטיים ולאנשי מקצוע.",
        ),
        block(
          "באולם התצוגה אפשר לראות ולמשש את הדגמים והגימורים מקרוב, ולבחור ידית שמתאימה למידה ולסגנון.",
        ),
        block(
          "[להשלמה: מתי נוסד העסק, מי עומד מאחוריו ומה מייחד אתכם. הטקסט הזה ממתין לבעלי העסק.]",
        ),
      ],
      en: [
        block(
          "Olam HaYadit is a family business in the Talpiot industrial area of Jerusalem, with a showroom for handles, hardware and bathroom accessories, for homeowners and professionals.",
        ),
        block(
          "In the showroom you can see and handle the models and finishes up close, and choose a handle that fits the size and style.",
        ),
        block(
          "[To be added: when the business was founded, who runs it and what makes it different. Waiting for the owners.]",
        ),
      ],
    },
    legalDraft: false,
  });
  await tx.commit({ visibility: "async" });
  console.log("FAQ and about page done.");

  // SAMPLE projects.
  const img = (f: string) => upload("image", "images", f);
  const projects = [
    {
      id: "sample-project-black-kitchen",
      slug: "sample-black-kitchen",
      title: {
        he: "מטבח בגוון שחור מט (לדוגמה)",
        en: "Matte black kitchen (sample)",
      },
      cover: "sample-bar-black.png",
      gallery: ["sample-edge-black.png", "sample-knob-black.png"],
      products: ["kh01", "kh03", "kn04"],
    },
    {
      id: "sample-project-gold-bathroom",
      slug: "sample-gold-bathroom",
      title: {
        he: "חדר רחצה בגימור זהב (לדוגמה)",
        en: "Gold-finish bathroom (sample)",
      },
      cover: "sample-towelbar-gold.png",
      gallery: ["sample-hook-gold.png"],
      products: ["ba01", "ba03"],
    },
  ];
  for (const p of projects) {
    const alt = (f: string): L => ({
      he: `תמונה לדוגמה לפרויקט ${p.title.he}`,
      en: `Sample image for the project ${p.title.en} (${f.replace(/sample-|\.png/g, "")})`,
    });
    await client.createOrReplace({
      _id: p.id,
      _type: "project",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      cover: altImage(await img(p.cover), alt(p.cover)),
      gallery: await Promise.all(
        p.gallery.map(async (f) => altImage(await img(f), alt(f))),
      ),
      description: {
        he: "פרויקט לדוגמה, להמחשת עמוד הפרויקטים. בעלת החנות תחליף אותו בפרויקטים אמיתיים.",
        en: "A sample project to illustrate the projects page. It will be replaced with real projects.",
      },
      products: p.products.map((code) => ({
        ...ref(`sample-product-${code}`),
        _key: key(),
      })),
      isSample: true,
    });
  }
  console.log("Sample projects done.");

  // SAMPLE catalog PDF.
  await client.createOrReplace({
    _id: "sample-catalog-handles",
    _type: "catalogFile",
    title: {
      he: "קטלוג לדוגמה: ידיות לארונות ולמטבח",
      en: "Sample catalog: cabinet and kitchen handles",
    },
    file: {
      _type: "file",
      asset: ref(await upload("file", "media", "sample-catalog.pdf")),
    },
    cover: altImage(await img("sample-bar-gold.png"), {
      he: "שער הקטלוג לדוגמה: ידית בר בגימור זהב",
      en: "Sample catalog cover: gold bar handle",
    }),
    language: "he",
    order: 10,
    isSample: true,
  });
  console.log("Sample catalog done.");

  // SAMPLE hero video + poster, only if the owner hasn't set real ones.
  const home = await client.fetch<{
    heroVideo?: unknown;
    heroPoster?: unknown;
  } | null>(`*[_id == "homePage"][0]{heroVideo, heroPoster}`);
  const patch = client.patch("homePage").setIfMissing({
    intro: {
      he: "אולם תצוגה לידיות, פרזול ואביזרי אמבטיה בתלפיות, ירושלים. בדקו כאן דגמים, גימורים ומחירים, ובואו לראות ולמשש בחנות.",
      en: "A showroom for handles, hardware and bathroom accessories in Talpiot, Jerusalem. Browse models, finishes and prices here, then come and see them in the store.",
    },
  });
  if (!home?.heroVideo) {
    patch.set({
      heroVideo: {
        _type: "file",
        asset: ref(await upload("file", "media", "sample-hero.webm")),
      },
    });
  }
  if (!home?.heroPoster) {
    patch.set({
      heroPoster: {
        _type: "altImage",
        asset: ref(await upload("image", "media", "sample-hero-poster.png")),
        alt: {
          he: "תמונה לדוגמה: ידית בר שחורה על משטח בהיר",
          en: "Sample image: a black bar handle on a light surface",
        },
      },
    });
  }
  await patch.commit();
  console.log("Home page media done.");

  // Slogan and services exactly as on the store's sign (real facts, not samples).
  // setIfMissing: never overwrites what the owner already edited.
  const localeString = (value: L) => ({
    _type: "localeString",
    _key: key(),
    ...value,
  });
  await client
    .patch("siteSettings")
    .setIfMissing({
      slogan: {
        _type: "localeString",
        he: "איכות ושירות זה אנחנו!",
        en: "Quality and service: that's us!",
      },
      services: [
        localeString({ he: "פרזול למטבחים", en: "Kitchen hardware" }),
        localeString({ he: "כל סוגי הידיות", en: "Every kind of handle" }),
        localeString({ he: "אביזרי אמבטיה", en: "Bathroom accessories" }),
        localeString({
          he: "עבודות אלומיניום ופרזול",
          en: "Aluminium and hardware work",
        }),
      ],
    })
    .commit();
  console.log("Sign slogan and services done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
