/**
 * Seed data. Categories, finishes, materials and store details are REAL
 * (from the approved plan / confirmed by the store). Brands and products are
 * SAMPLES (isSample: true) and are removed with `npm run samples:remove`.
 */

type L = { he: string; en: string };

export const categories: {
  id: string;
  slug: string;
  title: L;
  allLabel: L;
  parent?: string;
  order: number;
  filters: string[];
}[] = [
  {
    id: "handles",
    slug: "handles",
    title: { he: "ידיות", en: "Handles" },
    allLabel: { he: "כל הידיות", en: "All handles" },
    order: 1,
    filters: [
      "brand",
      "finish",
      "material",
      "size",
      "holeToHole",
      "price",
      "inStock",
    ],
  },
  {
    id: "handles-kitchen-furniture",
    slug: "kitchen-furniture",
    parent: "handles",
    title: { he: "ידיות למטבח ולרהיטים", en: "Kitchen & furniture handles" },
    allLabel: {
      he: "כל הידיות למטבח ולרהיטים",
      en: "All kitchen & furniture handles",
    },
    order: 1,
    filters: ["brand", "finish", "material", "holeToHole", "price", "inStock"],
  },
  {
    id: "handles-door",
    slug: "door",
    parent: "handles",
    title: { he: "ידיות לדלתות", en: "Door handles" },
    allLabel: { he: "כל הידיות לדלתות", en: "All door handles" },
    order: 2,
    filters: ["brand", "finish", "material", "price", "inStock"],
  },
  {
    id: "handles-knobs",
    slug: "knobs",
    parent: "handles",
    title: { he: "כפתורים", en: "Knobs" },
    allLabel: { he: "כל הכפתורים", en: "All knobs" },
    order: 3,
    filters: ["brand", "finish", "material", "size", "price", "inStock"],
  },
  {
    id: "handles-fridge",
    slug: "fridge",
    parent: "handles",
    title: { he: "ידיות למקרר", en: "Fridge handles" },
    allLabel: { he: "כל הידיות למקרר", en: "All fridge handles" },
    order: 4,
    filters: ["finish", "holeToHole", "price", "inStock"],
  },
  {
    id: "technical",
    slug: "technical",
    title: { he: "פרזול טכני", en: "Technical hardware" },
    allLabel: { he: "כל הפרזול הטכני", en: "All technical hardware" },
    order: 2,
    filters: ["brand", "size", "price", "inStock"],
  },
  {
    id: "technical-hinges",
    slug: "hinges",
    parent: "technical",
    title: { he: "צירים", en: "Hinges" },
    allLabel: { he: "כל הצירים", en: "All hinges" },
    order: 1,
    filters: ["brand", "price", "inStock"],
  },
  {
    id: "technical-drawer-systems",
    slug: "drawer-systems",
    parent: "technical",
    title: { he: "מערכות מגירות", en: "Drawer systems" },
    allLabel: { he: "כל מערכות המגירות", en: "All drawer systems" },
    order: 2,
    filters: ["brand", "size", "price", "inStock"],
  },
  {
    id: "technical-legs",
    slug: "legs",
    parent: "technical",
    title: { he: "רגליים", en: "Legs" },
    allLabel: { he: "כל הרגליים", en: "All legs" },
    order: 3,
    filters: ["finish", "size", "price", "inStock"],
  },
  {
    id: "bathroom",
    slug: "bathroom",
    title: { he: "אביזרי אמבטיה", en: "Bathroom accessories" },
    allLabel: { he: "כל אביזרי האמבטיה", en: "All bathroom accessories" },
    order: 3,
    filters: ["brand", "finish", "price", "inStock"],
  },
  {
    id: "kitchen-storage",
    slug: "kitchen-storage",
    title: { he: "אחסון למטבח", en: "Kitchen storage" },
    allLabel: { he: "כל פתרונות האחסון למטבח", en: "All kitchen storage" },
    order: 4,
    filters: ["brand", "size", "price", "inStock"],
  },
  {
    id: "home-decor",
    slug: "home-decor",
    title: { he: "עיצוב הבית", en: "Home decor" },
    allLabel: { he: "כל מוצרי עיצוב הבית", en: "All home decor" },
    order: 5,
    filters: ["finish", "price", "inStock"],
  },
];

/** The five finishes the store confirmed as common. */
export const finishes: {
  id: string;
  name: L;
  swatch: string;
  order: number;
}[] = [
  { id: "gold", name: { he: "זהב", en: "Gold" }, swatch: "#C9A24B", order: 1 },
  {
    id: "rosegold",
    name: { he: "רוז גולד", en: "Rose gold" },
    swatch: "#C3907E",
    order: 2,
  },
  {
    id: "black",
    name: { he: "שחור", en: "Black" },
    swatch: "#2B2A28",
    order: 3,
  },
  {
    id: "nickel",
    name: { he: "ניקל", en: "Nickel" },
    swatch: "#A3A6A2",
    order: 4,
  },
  {
    id: "chrome",
    name: { he: "כרום", en: "Chrome" },
    swatch: "#C9CED1",
    order: 5,
  },
];

export const materials: { id: string; name: L }[] = [
  { id: "zamak", name: { he: "סגסוגת אבץ (זמאק)", en: "Zinc alloy (zamak)" } },
  { id: "aluminium", name: { he: "אלומיניום", en: "Aluminium" } },
  { id: "stainless", name: { he: "נירוסטה", en: "Stainless steel" } },
  { id: "brass", name: { he: "פליז", en: "Brass" } },
  { id: "steel", name: { he: "פלדה", en: "Steel" } },
];

export const sampleBrands: { id: string; name: string; description: L }[] = [
  {
    id: "sample-brand-a",
    name: "מותג לדוגמה א",
    description: {
      he: "מותג לדוגמה. יוחלף במותגים האמיתיים של החנות.",
      en: "Sample brand. Will be replaced by the store's real brands.",
    },
  },
  {
    id: "sample-brand-b",
    name: "מותג לדוגמה ב",
    description: {
      he: "מותג לדוגמה. יוחלף במותגים האמיתיים של החנות.",
      en: "Sample brand. Will be replaced by the store's real brands.",
    },
  },
  {
    id: "sample-brand-c",
    name: "מותג לדוגמה ג",
    description: {
      he: "מותג לדוגמה. יוחלף במותגים האמיתיים של החנות.",
      en: "Sample brand. Will be replaced by the store's real brands.",
    },
  },
];

type Shape =
  | "bar"
  | "edge"
  | "knob"
  | "lever"
  | "fridge"
  | "hinge"
  | "runner"
  | "leg"
  | "towelbar"
  | "basket"
  | "hook";

export interface SampleProduct {
  code: string;
  title: L;
  category: string;
  shape: Shape;
  material: string;
  brand: string;
  finishes: string[];
  /** Each size becomes a variant per finish. */
  sizes: {
    label: L;
    holeToHoleMm?: number;
    lengthMm?: number;
    price: number;
  }[];
  specs?: { label: L; value: L }[];
  isNew?: boolean;
  featured?: boolean;
}

const bar = (cc: number, extra = 0) => ({
  label: { he: `${cc} מ״מ`, en: `${cc} mm` },
  holeToHoleMm: cc,
  lengthMm: cc + 24,
  price: Math.round((34 + cc * 0.12 + extra) / 5) * 5 - 0.1,
});
const one = (price: number) => [{ label: { he: "", en: "" }, price }];
const len = (cm: number, price: number) => ({
  label: { he: `${cm} ס״מ`, en: `${cm} cm` },
  lengthMm: cm * 10,
  price,
});

export const sampleProducts: SampleProduct[] = [
  // Kitchen & furniture handles (10)
  {
    code: "KH01",
    title: { he: "ידית בר עגולה", en: "Round bar handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "zamak",
    brand: "sample-brand-a",
    finishes: ["black", "gold", "nickel"],
    sizes: [96, 128, 160, 192].map((c) => bar(c)),
    featured: true,
    specs: [
      {
        label: { he: "קוטר", en: "Diameter" },
        value: { he: "12 מ״מ", en: "12 mm" },
      },
      {
        label: { he: "ברגים", en: "Screws" },
        value: { he: "M4, כלולים", en: "M4, included" },
      },
    ],
  },
  {
    code: "KH02",
    title: { he: "ידית בר מרובעת", en: "Square bar handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "aluminium",
    brand: "sample-brand-a",
    finishes: ["black", "chrome"],
    sizes: [128, 160, 224, 320].map((c) => bar(c, 8)),
    isNew: true,
  },
  {
    code: "KH03",
    title: { he: "ידית פרופיל לקצה הדלת", en: "Edge profile handle" },
    category: "handles-kitchen-furniture",
    shape: "edge",
    material: "aluminium",
    brand: "sample-brand-b",
    finishes: ["black", "gold"],
    sizes: [96, 128, 160].map((c) => bar(c, 12)),
    featured: true,
  },
  {
    code: "KH04",
    title: { he: "ידית בר מינימליסטית דקה", en: "Slim minimal bar handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "stainless",
    brand: "sample-brand-c",
    finishes: ["nickel", "black"],
    sizes: [160, 192, 256].map((c) => bar(c, 4)),
  },
  {
    code: "KH05",
    title: { he: "ידית פליז מוברש", en: "Brushed brass handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "brass",
    brand: "sample-brand-b",
    finishes: ["gold"],
    sizes: [128, 160, 192].map((c) => bar(c, 40)),
    isNew: true,
    featured: true,
  },
  {
    code: "KH06",
    title: { he: "ידית קשת קלאסית", en: "Classic bow handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "zamak",
    brand: "sample-brand-c",
    finishes: ["rosegold", "gold", "nickel"],
    sizes: [96, 128].map((c) => bar(c, 6)),
  },
  {
    code: "KH07",
    title: { he: "ידית בר ארוכה לארון בגדים", en: "Long wardrobe bar handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "aluminium",
    brand: "sample-brand-a",
    finishes: ["black", "nickel"],
    sizes: [320, 448, 640].map((c) => bar(c, 10)),
  },
  {
    code: "KH08",
    title: { he: "ידית פרופיל שקועה", en: "Recessed profile handle" },
    category: "handles-kitchen-furniture",
    shape: "edge",
    material: "aluminium",
    brand: "sample-brand-b",
    finishes: ["black", "chrome"],
    sizes: [160, 192, 256].map((c) => bar(c, 15)),
  },
  {
    code: "KH09",
    title: { he: "ידית רוז גולד מעוגלת", en: "Rounded rose gold handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "zamak",
    brand: "sample-brand-c",
    finishes: ["rosegold"],
    sizes: [96, 128, 160].map((c) => bar(c, 10)),
    isNew: true,
  },
  {
    code: "KH10",
    title: { he: "ידית בר כרום מבריק", en: "Polished chrome bar handle" },
    category: "handles-kitchen-furniture",
    shape: "bar",
    material: "stainless",
    brand: "sample-brand-a",
    finishes: ["chrome"],
    sizes: [128, 160, 192, 224].map((c) => bar(c, 2)),
  },
  // Door handles (5)
  {
    code: "DH01",
    title: { he: "ידית מנוף על רוזטה עגולה", en: "Lever handle on round rose" },
    category: "handles-door",
    shape: "lever",
    material: "zamak",
    brand: "sample-brand-b",
    finishes: ["black", "nickel", "gold"],
    sizes: one(189.9),
    featured: true,
    specs: [
      {
        label: { he: "עובי דלת מתאים", en: "Door thickness" },
        value: { he: "38–50 מ״מ", en: "38–50 mm" },
      },
    ],
  },
  {
    code: "DH02",
    title: { he: "ידית מנוף מינימליסטית", en: "Minimal lever handle" },
    category: "handles-door",
    shape: "lever",
    material: "stainless",
    brand: "sample-brand-a",
    finishes: ["black", "nickel"],
    sizes: one(229.9),
    isNew: true,
  },
  {
    code: "DH03",
    title: { he: "ידית לדלת כניסה", en: "Entrance door handle" },
    category: "handles-door",
    shape: "lever",
    material: "brass",
    brand: "sample-brand-c",
    finishes: ["gold", "black"],
    sizes: one(349.9),
  },
  {
    code: "DH04",
    title: {
      he: "ידית לדלת פנים, רוזטה מרובעת",
      en: "Interior lever, square rose",
    },
    category: "handles-door",
    shape: "lever",
    material: "zamak",
    brand: "sample-brand-b",
    finishes: ["chrome", "black"],
    sizes: one(159.9),
  },
  {
    code: "DH05",
    title: { he: "ידית מנוף לחדר רחצה", en: "Bathroom privacy lever" },
    category: "handles-door",
    shape: "lever",
    material: "zamak",
    brand: "sample-brand-a",
    finishes: ["nickel", "chrome"],
    sizes: one(209.9),
  },
  // Knobs (6)
  {
    code: "KN01",
    title: { he: "כפתור עגול שטוח", en: "Flat round knob" },
    category: "handles-knobs",
    shape: "knob",
    material: "zamak",
    brand: "sample-brand-a",
    finishes: ["black", "gold", "nickel", "rosegold"],
    sizes: [
      { label: { he: "Ø25 מ״מ", en: "Ø25 mm" }, price: 19.9 },
      { label: { he: "Ø32 מ״מ", en: "Ø32 mm" }, price: 24.9 },
    ],
    featured: true,
  },
  {
    code: "KN02",
    title: { he: "כפתור פליז מחורץ", en: "Knurled brass knob" },
    category: "handles-knobs",
    shape: "knob",
    material: "brass",
    brand: "sample-brand-c",
    finishes: ["gold"],
    sizes: one(44.9),
    isNew: true,
  },
  {
    code: "KN03",
    title: { he: "כפתור כדור קלאסי", en: "Classic ball knob" },
    category: "handles-knobs",
    shape: "knob",
    material: "zamak",
    brand: "sample-brand-b",
    finishes: ["chrome", "nickel"],
    sizes: one(17.9),
  },
  {
    code: "KN04",
    title: { he: "כפתור שחור מט", en: "Matte black knob" },
    category: "handles-knobs",
    shape: "knob",
    material: "aluminium",
    brand: "sample-brand-a",
    finishes: ["black"],
    sizes: one(22.9),
  },
  {
    code: "KN05",
    title: { he: "כפתור רוז גולד", en: "Rose gold knob" },
    category: "handles-knobs",
    shape: "knob",
    material: "zamak",
    brand: "sample-brand-c",
    finishes: ["rosegold"],
    sizes: one(26.9),
  },
  {
    code: "KN06",
    title: {
      he: "כפתור נירוסטה לחדר רטוב",
      en: "Stainless knob for wet rooms",
    },
    category: "handles-knobs",
    shape: "knob",
    material: "stainless",
    brand: "sample-brand-b",
    finishes: ["nickel"],
    sizes: one(29.9),
  },
  // Fridge handles (3)
  {
    code: "FR01",
    title: { he: "ידית למקרר משולב", en: "Integrated fridge handle" },
    category: "handles-fridge",
    shape: "fridge",
    material: "stainless",
    brand: "sample-brand-a",
    finishes: ["nickel", "black"],
    sizes: [300, 450, 600].map((c) => ({
      label: { he: `${c} מ״מ`, en: `${c} mm` },
      holeToHoleMm: c,
      lengthMm: c + 40,
      price: Math.round(c * 0.4) - 0.1,
    })),
  },
  {
    code: "FR02",
    title: { he: "ידית מקרר זהב", en: "Gold fridge handle" },
    category: "handles-fridge",
    shape: "fridge",
    material: "brass",
    brand: "sample-brand-c",
    finishes: ["gold"],
    sizes: [450, 600].map((c) => ({
      label: { he: `${c} מ״מ`, en: `${c} mm` },
      holeToHoleMm: c,
      lengthMm: c + 40,
      price: Math.round(c * 0.6) - 0.1,
    })),
  },
  {
    code: "FR03",
    title: { he: "ידית מקרר שחורה עגולה", en: "Round black fridge handle" },
    category: "handles-fridge",
    shape: "fridge",
    material: "aluminium",
    brand: "sample-brand-b",
    finishes: ["black"],
    sizes: [300, 450].map((c) => ({
      label: { he: `${c} מ״מ`, en: `${c} mm` },
      holeToHoleMm: c,
      lengthMm: c + 40,
      price: Math.round(c * 0.35) - 0.1,
    })),
  },
  // Hinges (4)
  {
    code: "HG01",
    title: {
      he: "ציר כוס 35 מ״מ טריקה שקטה",
      en: "35 mm soft-close cup hinge",
    },
    category: "technical-hinges",
    shape: "hinge",
    material: "steel",
    brand: "sample-brand-a",
    finishes: ["nickel"],
    sizes: one(14.9),
    featured: true,
    specs: [
      {
        label: { he: "זווית פתיחה", en: "Opening angle" },
        value: { he: "110°", en: "110°" },
      },
    ],
  },
  {
    code: "HG02",
    title: { he: "ציר כוס חצי חפייה", en: "Half-overlay cup hinge" },
    category: "technical-hinges",
    shape: "hinge",
    material: "steel",
    brand: "sample-brand-b",
    finishes: ["nickel"],
    sizes: one(12.9),
  },
  {
    code: "HG03",
    title: { he: "ציר לפינה 165°", en: "165° corner hinge" },
    category: "technical-hinges",
    shape: "hinge",
    material: "steel",
    brand: "sample-brand-a",
    finishes: ["nickel"],
    sizes: one(39.9),
  },
  {
    code: "HG04",
    title: { he: "ציר שחור לחזיתות כהות", en: "Black hinge for dark fronts" },
    category: "technical-hinges",
    shape: "hinge",
    material: "steel",
    brand: "sample-brand-c",
    finishes: ["black"],
    sizes: one(18.9),
    isNew: true,
  },
  // Drawer systems (3)
  {
    code: "DR01",
    title: {
      he: "מסילה טלסקופית מלאה",
      en: "Full-extension telescopic runner",
    },
    category: "technical-drawer-systems",
    shape: "runner",
    material: "steel",
    brand: "sample-brand-a",
    finishes: ["nickel"],
    sizes: [30, 40, 50].map((cm) => len(cm, 30 + cm)),
  },
  {
    code: "DR02",
    title: { he: "מסילה נסתרת טריקה שקטה", en: "Concealed soft-close runner" },
    category: "technical-drawer-systems",
    shape: "runner",
    material: "steel",
    brand: "sample-brand-b",
    finishes: ["nickel"],
    sizes: [40, 50].map((cm) => len(cm, 90 + cm)),
  },
  {
    code: "DR03",
    title: {
      he: "מסילת כדוריות למגירה כבדה",
      en: "Heavy-duty ball-bearing runner",
    },
    category: "technical-drawer-systems",
    shape: "runner",
    material: "steel",
    brand: "sample-brand-c",
    finishes: ["black", "nickel"],
    sizes: [45, 60].map((cm) => len(cm, 60 + cm)),
  },
  // Legs (3)
  {
    code: "LG01",
    title: { he: "רגל קונית לרהיט", en: "Tapered furniture leg" },
    category: "technical-legs",
    shape: "leg",
    material: "steel",
    brand: "sample-brand-a",
    finishes: ["black", "gold"],
    sizes: [10, 15].map((cm) => len(cm, 25 + cm)),
  },
  {
    code: "LG02",
    title: { he: "רגל מתכווננת למטבח", en: "Adjustable kitchen leg" },
    category: "technical-legs",
    shape: "leg",
    material: "steel",
    brand: "sample-brand-b",
    finishes: ["nickel"],
    sizes: [len(10, 9.9)],
  },
  {
    code: "LG03",
    title: { he: "רגל עגולה לספה", en: "Round sofa leg" },
    category: "technical-legs",
    shape: "leg",
    material: "aluminium",
    brand: "sample-brand-c",
    finishes: ["black", "chrome"],
    sizes: [len(12, 34.9)],
  },
  // Bathroom (4)
  {
    code: "BA01",
    title: { he: "מתלה מגבות", en: "Towel bar" },
    category: "bathroom",
    shape: "towelbar",
    material: "stainless",
    brand: "sample-brand-a",
    finishes: ["black", "chrome", "gold"],
    sizes: [len(60, 149.9), len(80, 179.9)],
    featured: true,
  },
  {
    code: "BA02",
    title: { he: "וו למגבת", en: "Towel hook" },
    category: "bathroom",
    shape: "hook",
    material: "stainless",
    brand: "sample-brand-b",
    finishes: ["black", "chrome"],
    sizes: one(49.9),
  },
  {
    code: "BA03",
    title: { he: "מחזיק נייר טואלט", en: "Toilet paper holder" },
    category: "bathroom",
    shape: "towelbar",
    material: "stainless",
    brand: "sample-brand-a",
    finishes: ["black", "chrome", "gold"],
    sizes: one(89.9),
    isNew: true,
  },
  {
    code: "BA04",
    title: { he: "מתלה מגבות כפול", en: "Double towel bar" },
    category: "bathroom",
    shape: "towelbar",
    material: "stainless",
    brand: "sample-brand-c",
    finishes: ["chrome"],
    sizes: [len(60, 219.9)],
  },
  // Kitchen storage (1)
  {
    code: "KS01",
    title: { he: "סל נשלף לארון מטבח", en: "Pull-out kitchen basket" },
    category: "kitchen-storage",
    shape: "basket",
    material: "steel",
    brand: "sample-brand-b",
    finishes: ["nickel", "black"],
    sizes: [len(30, 249.9), len(40, 289.9)],
  },
  // Home decor (1)
  {
    code: "HD01",
    title: { he: "וו קיר דקורטיבי", en: "Decorative wall hook" },
    category: "home-decor",
    shape: "hook",
    material: "brass",
    brand: "sample-brand-c",
    finishes: ["gold", "black"],
    sizes: one(39.9),
    isNew: true,
  },
];

/** Confirmed store details (2026-11-23). Unknown values are left empty on purpose. */
export const siteSettings = {
  businessName: { he: "עולם הידית והפרזול", en: "Olam HaYadit" },
  street: { he: "יד חרוצים 16", en: "16 Yad Harutsim St." },
  area: { he: "אזור התעשייה תלפיות", en: "Talpiot Industrial Area" },
  city: { he: "ירושלים", en: "Jerusalem" },
  storePhone: "02-6749235",
  mobilePhone: "052-3471766",
  whatsapp: "052-3471766",
  hours: {
    sunday: { closed: false, opens: "07:30", closes: "18:00" },
    monday: { closed: false, opens: "07:30", closes: "18:00" },
    tuesday: { closed: false, opens: "07:30", closes: "18:00" },
    wednesday: { closed: false, opens: "07:30", closes: "18:00" },
    thursday: { closed: false, opens: "07:30", closes: "18:00" },
    friday: { closed: false, opens: "07:30", closes: "13:00" },
    saturday: { closed: true },
  },
  hoursNote: {
    he: "בחגים ובערבי חג השעות עשויות להשתנות.",
    en: "Hours may change on holidays and holiday eves.",
  },
};
