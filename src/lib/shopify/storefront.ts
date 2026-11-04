import "server-only";
import { htmlToText, sanitizeHtml } from "./sanitize";
import type { Cart, CartApi, CartLine, CartLineInput, CatalogAdapter, Collection, Money, Product, ProductImage, Variant } from "./types";

// Storefront GraphQL adapter, used when SHOPIFY_STOREFRONT_TOKEN is set.
// Endpoint: https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json
// Header:   X-Shopify-Storefront-Access-Token
// Scopes the token needs: unauthenticated_read_product_listings, unauthenticated_read_product_inventory,
// unauthenticated_read_product_tags, unauthenticated_write_checkouts, unauthenticated_read_checkouts.

type Gql<T> = { data?: T; errors?: { message: string }[] };

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2026-10";
  if (!domain || !token) throw new Error("Storefront API is not configured (SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN).");
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-shopify-storefront-access-token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Storefront API responded ${res.status}`);
  const json = (await res.json()) as Gql<T>;
  if (json.errors?.length) throw new Error(`Storefront API: ${json.errors.map((e) => e.message).join("; ")}`);
  if (!json.data) throw new Error("Storefront API returned no data");
  return json.data;
}

// ---------- Fragments ----------

const IMAGE = `url width height altText`;
const MONEY = `amount currencyCode`;

const PRODUCT = `
fragment ProductFields on Product {
  id handle title descriptionHtml description productType vendor tags availableForSale updatedAt
  featuredImage { ${IMAGE} }
  images(first: 10) { nodes { ${IMAGE} } }
  options { name values }
  variants(first: 50) { nodes {
    id title sku availableForSale
    price { ${MONEY} } compareAtPrice { ${MONEY} }
    selectedOptions { name value }
    image { ${IMAGE} }
  } }
  collections(first: 10) { nodes { handle } }
}`;

const CART = `
fragment CartFields on Cart {
  id checkoutUrl totalQuantity
  cost { subtotalAmount { ${MONEY} } }
  lines(first: 100) { nodes {
    id quantity
    merchandise { ... on ProductVariant {
      id title
      price { ${MONEY} }
      image { ${IMAGE} }
      product { handle title featuredImage { ${IMAGE} } }
    } }
  } }
}`;

// ---------- Raw shapes and mappers ----------

type RawImage = { url: string; width: number | null; height: number | null; altText: string | null };
type RawMoney = { amount: string; currencyCode: string };
type RawProduct = {
  id: string; handle: string; title: string; descriptionHtml: string; description: string; productType: string; vendor: string;
  tags: string[]; availableForSale: boolean; updatedAt: string; featuredImage: RawImage | null;
  images: { nodes: RawImage[] }; options: { name: string; values: string[] }[];
  variants: { nodes: { id: string; title: string; sku: string | null; availableForSale: boolean; price: RawMoney; compareAtPrice: RawMoney | null; selectedOptions: { name: string; value: string }[]; image: RawImage | null }[] };
  collections: { nodes: { handle: string }[] };
};

const img = (i: RawImage | null): ProductImage | null => (i ? { url: i.url, width: i.width, height: i.height, altText: i.altText } : null);

function mapProduct(p: RawProduct): Product {
  const variants: Variant[] = p.variants.nodes.map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku || null,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    available: v.availableForSale,
    selectedOptions: v.selectedOptions,
    image: img(v.image),
  }));
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    descriptionHtml: sanitizeHtml(p.descriptionHtml),
    description: p.description || htmlToText(p.descriptionHtml),
    productType: p.productType,
    vendor: p.vendor,
    tags: p.tags,
    availableForSale: p.availableForSale,
    featuredImage: img(p.featuredImage),
    images: p.images.nodes.map(img).filter((i): i is ProductImage => i !== null),
    options: p.options,
    variants,
    collections: p.collections.nodes.map((c) => c.handle),
    updatedAt: p.updatedAt,
  };
}

// ---------- Catalogue ----------

export const storefrontAdapter: CatalogAdapter = {
  mode: "storefront",

  async products() {
    const out: Product[] = [];
    let after: string | null = null;
    for (let page = 0; page < 20; page++) {
      const data: { products: { nodes: RawProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await storefront(
        `query Products($after: String) { products(first: 100, after: $after) { nodes { ...ProductFields } pageInfo { hasNextPage endCursor } } } ${PRODUCT}`,
        { after },
      );
      out.push(...data.products.nodes.map(mapProduct));
      if (!data.products.pageInfo.hasNextPage) break;
      after = data.products.pageInfo.endCursor;
    }
    return out;
  },

  async product(handle) {
    const data = await storefront<{ product: RawProduct | null }>(
      `query Product($handle: String!) { product(handle: $handle) { ...ProductFields } } ${PRODUCT}`,
      { handle },
    );
    return data.product ? mapProduct(data.product) : null;
  },

  async collections() {
    const data = await storefront<{ collections: { nodes: Collection[] } }>(
      `query Collections { collections(first: 20) { nodes { handle title description } } }`,
    );
    return data.collections.nodes;
  },

  async search(query) {
    const data = await storefront<{ products: { nodes: RawProduct[] } }>(
      `query Search($q: String!) { products(first: 50, query: $q) { nodes { ...ProductFields } } } ${PRODUCT}`,
      { q: query },
    );
    return data.products.nodes.map(mapProduct);
  },

  async recommendations(product) {
    const data = await storefront<{ productRecommendations: RawProduct[] | null }>(
      `query Recs($id: ID!) { productRecommendations(productId: $id) { ...ProductFields } } ${PRODUCT}`,
      { id: product.id },
    );
    return (data.productRecommendations ?? []).map(mapProduct).slice(0, 8);
  },
};

// ---------- Cart API ----------

type RawCart = {
  id: string; checkoutUrl: string; totalQuantity: number; cost: { subtotalAmount: RawMoney };
  lines: { nodes: { id: string; quantity: number; merchandise: { id: string; title: string; price: Money; image: RawImage | null; product: { handle: string; title: string; featuredImage: RawImage | null } } }[] };
};
type UserErrors = { userErrors?: { message: string }[] };

function mapCart(c: RawCart): Cart {
  const lines: CartLine[] = c.lines.nodes.map((l) => ({
    id: l.id,
    quantity: l.quantity,
    variantId: l.merchandise.id,
    variantTitle: l.merchandise.title,
    productHandle: l.merchandise.product.handle,
    productTitle: l.merchandise.product.title,
    price: l.merchandise.price,
    image: img(l.merchandise.image ?? l.merchandise.product.featuredImage),
  }));
  return { id: c.id, checkoutUrl: lines.length ? c.checkoutUrl : null, totalQuantity: c.totalQuantity, subtotal: c.cost.subtotalAmount, lines };
}

async function mutate(field: string, signature: string, args: string, variables: Record<string, unknown>): Promise<Cart> {
  const data = await storefront<Record<string, ({ cart: RawCart | null } & UserErrors) | undefined>>(
    `mutation ${field}(${signature}) { ${field}(${args}) { cart { ...CartFields } userErrors { message } } } ${CART}`,
    variables,
  );
  const result = data[field];
  if (result?.userErrors?.length) throw new Error(result.userErrors.map((e) => e.message).join("; "));
  if (!result?.cart) throw new Error("Shopify returned no cart");
  return mapCart(result.cart);
}

export const storefrontCart: CartApi = {
  async get(cartId) {
    const data = await storefront<{ cart: RawCart | null }>(`query Cart($id: ID!) { cart(id: $id) { ...CartFields } } ${CART}`, { id: cartId });
    return data.cart ? mapCart(data.cart) : null;
  },
  create: (lines) =>
    mutate("cartCreate", "$lines: [CartLineInput!]", "input: { lines: $lines }", {
      lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
    }),
  addLines: (cartId, lines: CartLineInput[]) =>
    mutate("cartLinesAdd", "$cartId: ID!, $lines: [CartLineInput!]!", "cartId: $cartId, lines: $lines", {
      cartId,
      lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
    }),
  updateLines: (cartId, lines) =>
    mutate("cartLinesUpdate", "$cartId: ID!, $lines: [CartLineUpdateInput!]!", "cartId: $cartId, lines: $lines", { cartId, lines }),
  removeLines: (cartId, lineIds) =>
    mutate("cartLinesRemove", "$cartId: ID!, $lineIds: [ID!]!", "cartId: $cartId, lineIds: $lineIds", { cartId, lineIds }),
};
