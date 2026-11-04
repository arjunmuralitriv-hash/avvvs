import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicJsonAdapter } from "./public-json";
import { storefrontAdapter, storefrontCart } from "./storefront";
import type { CartApi, CatalogAdapter, Collection, Product, ShopMode } from "./types";

// Adapter selection: a Storefront token in the environment means the Storefront API,
// an empty token means the public JSON fallback (client-side cart, Shopify permalink checkout).
export function shopMode(): ShopMode {
  return process.env.SHOPIFY_STOREFRONT_TOKEN ? "storefront" : "public-json";
}

const adapter = (): CatalogAdapter => (shopMode() === "storefront" ? storefrontAdapter : publicJsonAdapter);

/** The server-side cart. Null in fallback mode, where the cart lives in the browser. */
export const cartApi = (): CartApi | null => (shopMode() === "storefront" ? storefrontCart : null);

// Display labels. The Shopify collection titles are GENERIC / PROPRIETARY / COSMETICS; the old site calls GENERIC "Classical".
export const COLLECTION_ORDER = ["proprietary", "classical", "cosmetics"] as const;
export const COLLECTION_LABELS: Record<string, string> = { proprietary: "Proprietary", classical: "Classical", cosmetics: "Cosmetics" };
export const collectionLabel = (handle: string) => COLLECTION_LABELS[handle] ?? handle.charAt(0).toUpperCase() + handle.slice(1);

// ---------- Cached catalogue reads ----------
// "hours" cacheLife, tagged "products" (everything) and `product:${handle}` (one product).
// The Shopify webhook at /api/shopify/revalidate invalidates these tags.

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return adapter().products();
}

export async function getProduct(handle: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${handle}`);
  return adapter().product(handle);
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return adapter().collections();
}

export async function getRecommendations(handle: string): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${handle}`);
  const product = await adapter().product(handle);
  return product ? adapter().recommendations(product) : [];
}

export async function searchProducts(query: string): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return adapter().search(query);
}

/** Products of one collection, from the cached full catalogue. */
export async function getCollectionProducts(handle: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.collections.includes(handle));
}
