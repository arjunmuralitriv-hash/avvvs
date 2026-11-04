import "server-only";
import { STORE_ORIGIN, CURRENCY } from "./format";
import { htmlToText, sanitizeHtml } from "./sanitize";
import type { CatalogAdapter, Collection, Product, ProductImage, Variant } from "./types";

// Fallback adapter. Reads the public Shopify JSON endpoints of avvvsglobal.com:
//   /products.json?limit=250&page=N       (paginated until empty)
//   /collections.json
//   /collections/<handle>/products.json   (used to learn which collection each product is in)
// Used when SHOPIFY_STOREFRONT_TOKEN is empty. The cart is client-side in this mode.

type RawImage = { src: string; width?: number; height?: number; alt?: string | null };
type RawVariant = { id: number; title: string; sku?: string; price: string; compare_at_price: string | null; available: boolean; option1: string | null; option2: string | null; option3: string | null; featured_image?: RawImage | null };
type RawProduct = { id: number; title: string; handle: string; body_html: string | null; vendor: string; product_type: string; tags: string[] | string; updated_at: string; variants: RawVariant[]; images: RawImage[]; options: { name: string; values: string[] }[] };

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${STORE_ORIGIN}${path}`, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Shopify public JSON ${path} responded ${res.status}`);
  return (await res.json()) as T;
}

const image = (i: RawImage | null | undefined): ProductImage | null =>
  i?.src ? { url: i.src, width: i.width ?? null, height: i.height ?? null, altText: i.alt ?? null } : null;

function mapProduct(p: RawProduct, collections: string[]): Product {
  const options = p.options ?? [];
  const variants: Variant[] = p.variants.map((v) => {
    const values = [v.option1, v.option2, v.option3];
    return {
      id: String(v.id),
      title: v.title,
      sku: v.sku || null,
      price: { amount: v.price, currencyCode: CURRENCY },
      compareAtPrice: v.compare_at_price ? { amount: v.compare_at_price, currencyCode: CURRENCY } : null,
      available: v.available,
      selectedOptions: options.map((o, i) => ({ name: o.name, value: values[i] ?? "" })).filter((o) => o.value),
      image: image(v.featured_image),
    };
  });
  const images = p.images.map(image).filter((i): i is ProductImage => i !== null);
  return {
    id: String(p.id),
    handle: p.handle,
    title: p.title,
    descriptionHtml: sanitizeHtml(p.body_html ?? ""),
    description: htmlToText(p.body_html ?? ""),
    productType: p.product_type,
    vendor: p.vendor,
    tags: Array.isArray(p.tags) ? p.tags : p.tags ? p.tags.split(",").map((t) => t.trim()) : [],
    availableForSale: variants.some((v) => v.available),
    featuredImage: images[0] ?? null,
    images,
    options,
    variants,
    collections,
    updatedAt: p.updated_at,
  };
}

async function fetchAllRaw(): Promise<RawProduct[]> {
  const all: RawProduct[] = [];
  for (let page = 1; page <= 20; page++) {
    const { products } = await getJson<{ products: RawProduct[] }>(`/products.json?limit=250&page=${page}`);
    if (!products.length) break;
    all.push(...products);
  }
  return all;
}

type Loaded = { products: Product[]; collections: Collection[] };

async function load(): Promise<Loaded> {
  const [raw, list] = await Promise.all([
    fetchAllRaw(),
    getJson<{ collections: { handle: string; title: string; description: string }[] }>("/collections.json"),
  ]);
  const collections = list.collections.map((c) => ({ handle: c.handle, title: c.title, description: c.description ?? "" }));
  const membership = new Map<string, string[]>();
  await Promise.all(
    collections.map(async (c) => {
      const { products } = await getJson<{ products: { handle: string }[] }>(`/collections/${c.handle}/products.json?limit=250`);
      for (const p of products) membership.set(p.handle, [...(membership.get(p.handle) ?? []), c.handle]);
    }),
  );
  return { products: raw.map((p) => mapProduct(p, membership.get(p.handle) ?? [])), collections };
}

// A short in-process memo, so building ~165 product pages does not re-download the catalogue 165 times.
// The real cache is "use cache" in ./index.ts; this only de-duplicates concurrent callers.
let memo: { at: number; value: Promise<Loaded> } | null = null;
function loadMemo(): Promise<Loaded> {
  if (!memo || Date.now() - memo.at > 60_000) {
    const value = load();
    value.catch(() => {
      if (memo?.value === value) memo = null;
    });
    memo = { at: Date.now(), value };
  }
  return memo.value;
}

export const publicJsonAdapter: CatalogAdapter = {
  mode: "public-json",
  async products() {
    return (await loadMemo()).products;
  },
  async product(handle) {
    return (await loadMemo()).products.find((p) => p.handle === handle) ?? null;
  },
  async collections() {
    return (await loadMemo()).collections;
  },
  async search(query) {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    const { products } = await loadMemo();
    return products.filter((p) => {
      const hay = `${p.title} ${p.productType} ${p.tags.join(" ")} ${p.description}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  },
  async recommendations(product) {
    // Shopify's recommendation engine is Storefront-only. Here: same product type first, then same collection, by title.
    const { products } = await loadMemo();
    const others = products.filter((p) => p.handle !== product.handle && p.availableForSale);
    const sameType = others.filter((p) => p.productType === product.productType);
    const sameCollection = others.filter((p) => p.productType !== product.productType && p.collections.some((c) => product.collections.includes(c)));
    const byTitle = (a: Product, b: Product) => a.title.localeCompare(b.title);
    return [...sameType.sort(byTitle), ...sameCollection.sort(byTitle)].slice(0, 8);
  },
};
