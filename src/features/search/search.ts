import MiniSearch from "minisearch";
import type { IndexCategory, IndexProduct, SearchIndex } from "./search-index";

const FINAL_LETTERS: Record<string, string> = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

/**
 * Normalise a term for matching: lower case, no Hebrew vowel marks or
 * cantillation, final letters as regular letters (so "ידי" matches "ידית"),
 * no geresh/gershayim.
 */
export function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[֑-ׇ]/g, "")
    .replace(/[״׳"']/g, "")
    .replace(/[ךםןףץ]/g, (ch) => FINAL_LETTERS[ch] ?? ch);
}

/** Split on spaces/punctuation, keeping SKU parts (letters+digits) intact. */
function tokenize(text: string): string[] {
  return text.split(/[\s\p{P}\p{S}]+/u).filter(Boolean);
}

interface Doc {
  id: string;
  kind: "product" | "category";
  title: string;
  sku: string;
  categories: string;
  extra: string;
}

export type SearchHit =
  | { kind: "product"; product: IndexProduct; score: number }
  | { kind: "category"; category: IndexCategory; score: number };

export interface Searcher {
  search(query: string): {
    products: IndexProduct[];
    categories: IndexCategory[];
  };
}

/** Build an in-memory searcher over both languages' text. */
export function createSearcher(index: SearchIndex): Searcher {
  const docs: Doc[] = [
    ...index.products.map((p) => ({
      id: `p:${p.id}`,
      kind: "product" as const,
      title: [p.title.he, p.title.en].filter(Boolean).join(" "),
      sku: [p.sku, ...p.variants.map((v) => v.sku)].join(" "),
      categories: p.categories.flatMap((c) => [c.he, c.en ?? ""]).join(" "),
      extra: [
        p.brand ?? "",
        ...p.variants.flatMap((v) => [
          v.finish?.he,
          v.finish?.en,
          v.size?.he,
          v.size?.en,
        ]),
      ]
        .filter(Boolean)
        .join(" "),
    })),
    ...index.categories.map((c) => ({
      id: `c:${c.path}`,
      kind: "category" as const,
      title: [c.title.he, c.title.en].filter(Boolean).join(" "),
      sku: "",
      categories: [c.parent?.he, c.parent?.en].filter(Boolean).join(" "),
      extra: "",
    })),
  ];

  const mini = new MiniSearch<Doc>({
    fields: ["title", "sku", "categories", "extra"],
    storeFields: ["kind"],
    tokenize,
    processTerm: (term) => {
      const t = normalizeTerm(term);
      return t.length ? t : null;
    },
    searchOptions: {
      boost: { title: 3, sku: 3, categories: 1.5, extra: 1 },
      prefix: true,
      fuzzy: (term) => (term.length > 4 ? 0.2 : false),
      combineWith: "AND",
    },
  });
  mini.addAll(docs);

  const productsById = new Map(index.products.map((p) => [`p:${p.id}`, p]));
  const categoriesById = new Map(
    index.categories.map((c) => [`c:${c.path}`, c]),
  );

  return {
    search(query: string) {
      const q = query.trim();
      if (!q) return { products: [], categories: [] };
      const results = mini.search(q);
      return {
        products: results
          .map((r) => productsById.get(String(r.id)))
          .filter((p): p is IndexProduct => Boolean(p)),
        categories: results
          .map((r) => categoriesById.get(String(r.id)))
          .filter((c): c is IndexCategory => Boolean(c))
          .slice(0, 6),
      };
    },
  };
}
