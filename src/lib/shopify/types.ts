// One domain model for the store. Both adapters (Storefront API, public JSON) return exactly these shapes.
// Everything here is plain, serialisable data so it can cross the "use cache" and server/client boundaries.

export type Money = { amount: string; currencyCode: string };

export type ProductImage = { url: string; width: number | null; height: number | null; altText: string | null };

export type SelectedOption = { name: string; value: string };

export type Variant = {
  /** Storefront mode: gid://shopify/ProductVariant/123. Public-JSON mode: "123". Use numericId() for permalinks. */
  id: string;
  title: string;
  sku: string | null;
  price: Money;
  compareAtPrice: Money | null;
  available: boolean;
  selectedOptions: SelectedOption[];
  image: ProductImage | null;
};

export type Product = {
  id: string;
  handle: string;
  /** Original Shopify title, usually ALL CAPS. Display it through titleCase(). */
  title: string;
  descriptionHtml: string;
  /** Plain-text description, for search and meta descriptions. */
  description: string;
  /** Shopify product_type, e.g. THAILAM. */
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  options: { name: string; values: string[] }[];
  variants: Variant[];
  /** Handles of the collections this product is in (proprietary, classical, cosmetics). */
  collections: string[];
  updatedAt: string;
};

export type Collection = { handle: string; title: string; description: string };

export type CartLine = {
  /** Storefront mode: the cart line gid. Fallback mode: the variant id. */
  id: string;
  quantity: number;
  variantId: string;
  variantTitle: string;
  productHandle: string;
  productTitle: string;
  /** Unit price. */
  price: Money;
  image: ProductImage | null;
};

export type Cart = {
  /** Storefront cart gid, or null in the client-side (fallback) cart. */
  id: string | null;
  /** Shopify checkout. Storefront mode: the cart's checkoutUrl. Fallback mode: a cart permalink. null when empty. */
  checkoutUrl: string | null;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
};

export type CartLineInput = { variantId: string; quantity: number };

/** What the catalogue adapters implement. */
export interface CatalogAdapter {
  readonly mode: "storefront" | "public-json";
  products(): Promise<Product[]>;
  product(handle: string): Promise<Product | null>;
  collections(): Promise<Collection[]>;
  search(query: string): Promise<Product[]>;
  recommendations(product: Product): Promise<Product[]>;
}

/** Server-side cart, available only in Storefront mode. */
export interface CartApi {
  get(cartId: string): Promise<Cart | null>;
  create(lines: CartLineInput[]): Promise<Cart>;
  addLines(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart>;
  removeLines(cartId: string, lineIds: string[]): Promise<Cart>;
}

export type ShopMode = CatalogAdapter["mode"];
