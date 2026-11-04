// URL <-> catalogue state. Pure functions, shared by the server page and the client controls.
// Filters live in URL search params so every view is shareable: /store/classical?type=THAILAM&q=oil&sort=price-asc&view=ledger&page=2
import type { Product } from "@/lib/shopify/types";

export const SORTS = {
  "name-asc": "Name, A to Z",
  "name-desc": "Name, Z to A",
  "price-asc": "Price, low to high",
  "price-desc": "Price, high to low",
} as const;
export type SortKey = keyof typeof SORTS;

export const PAGE_SIZE = 48;

export type CatalogueQuery = {
  /** Upper-case Shopify product_type, or "" for all. */
  type: string;
  q: string;
  sort: SortKey;
  view: "grid" | "ledger";
  page: number;
};

export const DEFAULT_QUERY: CatalogueQuery = { type: "", q: "", sort: "name-asc", view: "grid", page: 1 };

type RawParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseQuery(sp: RawParams): CatalogueQuery {
  const sort = one(sp.sort);
  const page = Number.parseInt(one(sp.page), 10);
  return {
    type: one(sp.type).trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, "").slice(0, 40),
    q: one(sp.q).trim().replace(/\s+/g, " ").slice(0, 80),
    sort: sort in SORTS ? (sort as SortKey) : DEFAULT_QUERY.sort,
    view: one(sp.view) === "ledger" ? "ledger" : "grid",
    page: Number.isInteger(page) && page > 0 && page < 1000 ? page : 1,
  };
}

/** Builds a URL, leaving out every parameter that holds its default value. */
export function buildHref(basePath: string, query: CatalogueQuery, change: Partial<CatalogueQuery> = {}): string {
  const next = { ...query, ...change };
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.q) params.set("q", next.q);
  if (next.sort !== DEFAULT_QUERY.sort) params.set("sort", next.sort);
  if (next.view !== DEFAULT_QUERY.view) params.set("view", next.view);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export const hasFilters = (q: CatalogueQuery) => Boolean(q.type || q.q);

export const lowestPrice = (p: Product) => Math.min(...p.variants.map((v) => Number(v.price.amount)));

export function matchesSearch(p: Product, q: string): boolean {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const hay = `${p.title} ${p.productType} ${p.tags.join(" ")} ${p.description}`.toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const byName = (a: Product, b: Product) => a.title.localeCompare(b.title, "en");
  const copy = [...products];
  switch (sort) {
    case "name-desc":
      return copy.sort((a, b) => byName(b, a));
    case "price-asc":
      return copy.sort((a, b) => lowestPrice(a) - lowestPrice(b) || byName(a, b));
    case "price-desc":
      return copy.sort((a, b) => lowestPrice(b) - lowestPrice(a) || byName(a, b));
    default:
      return copy.sort(byName);
  }
}
