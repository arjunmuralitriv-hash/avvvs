// Client cart store: one module-level store read with useSyncExternalStore, so every component shares it
// whether or not <CartProvider> wraps the page. Two persistence modes (see src/lib/shopify/index.ts):
//   public-json  the cart is a list of lines in localStorage; checkout is a Shopify cart permalink.
//   storefront   the cart is a Shopify Cart; the browser holds its id in an httpOnly cookie via server actions.
// Both modes update optimistically.
import { useSyncExternalStore } from "react";
import { addToCartAction, getCartAction, removeCartLineAction, updateCartLineAction, type CartResult } from "@/lib/shopify/cart-actions";
import { cartFromLines, emptyCart } from "@/lib/shopify/format";
import type { Cart, CartLine, Money, ProductImage, ShopMode } from "@/lib/shopify/types";

export type CartState = {
  mode: ShopMode | null;
  cart: Cart;
  /** False until the saved cart has been read in the browser. */
  ready: boolean;
  /** Server round trips in flight (Storefront mode). */
  pending: number;
  error: string | null;
  isOpen: boolean;
};

export type AddInput = {
  variantId: string;
  quantity: number;
  handle: string;
  title: string;
  variantTitle: string;
  price: Money;
  image: ProductImage | null;
};

const STORAGE_KEY = "avvvs-cart-v1";
const MAX_QTY = 99;
const initial: CartState = { mode: null, cart: emptyCart(), ready: false, pending: 0, error: null, isOpen: false };

let state: CartState = initial;
const listeners = new Set<() => void>();

function set(patch: Partial<CartState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useCartState(): CartState {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

// ---------- Fallback persistence ----------

const isLine = (l: unknown): l is CartLine => {
  if (!l || typeof l !== "object") return false;
  const x = l as Record<string, unknown>;
  const price = x.price as Record<string, unknown> | undefined;
  return (
    typeof x.id === "string" && typeof x.variantId === "string" && typeof x.productHandle === "string" && typeof x.productTitle === "string" &&
    typeof x.variantTitle === "string" && Number.isInteger(x.quantity) && (x.quantity as number) > 0 && (x.quantity as number) <= MAX_QTY &&
    !!price && typeof price.amount === "string" && Number.isFinite(Number(price.amount)) && typeof price.currencyCode === "string"
  );
};

function readStored(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch {
    return [];
  }
}

function writeStored(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private mode or a full quota: the cart still works for this page view.
  }
}

// ---------- Storefront queue ----------

let queue: Promise<unknown> = Promise.resolve();

function sync(call: () => Promise<CartResult>) {
  set({ pending: state.pending + 1, error: null });
  queue = queue.then(async () => {
    let result: CartResult;
    try {
      result = await call();
    } catch {
      result = { ok: false, error: "Could not reach the store. Check your connection and try again." };
    }
    const last = state.pending === 1;
    if (result.ok) {
      // Only the last response is authoritative; earlier ones would overwrite newer optimistic edits.
      set({ pending: state.pending - 1, ...(last ? { cart: result.cart ?? emptyCart() } : {}) });
    } else {
      set({ pending: state.pending - 1, error: result.error });
      if (last) {
        const fresh = await getCartAction().catch(() => null);
        if (fresh?.ok) set({ cart: fresh.cart ?? emptyCart() });
      }
    }
  });
}

// ---------- Public API ----------

let started = false;

export function initCart(mode: ShopMode) {
  if (started || typeof window === "undefined") return;
  started = true;
  if (mode === "public-json") {
    set({ mode, cart: cartFromLines(readStored()), ready: true });
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) set({ cart: cartFromLines(readStored()) });
    });
  } else {
    set({ mode });
    void getCartAction()
      // Do not overwrite optimistic edits made while this first read was in flight.
      .then((r) => set({ ready: true, ...(r.ok && state.pending === 0 ? { cart: r.cart ?? emptyCart() } : {}) }))
      .catch(() => set({ ready: true }));
  }
}

function commitLocal(lines: CartLine[]) {
  writeStored(lines);
  set({ cart: cartFromLines(lines), error: null });
}

export function addToCart(input: AddInput) {
  if (!state.mode) return; // initCart() has not run yet
  const qty = Math.max(1, Math.min(MAX_QTY, Math.floor(input.quantity)));
  const lines = state.cart.lines;
  const existing = lines.find((l) => l.variantId === input.variantId);
  const next: CartLine[] = existing
    ? lines.map((l) => (l === existing ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + qty) } : l))
    : [
        ...lines,
        {
          id: state.mode === "storefront" ? `pending:${input.variantId}` : input.variantId,
          quantity: qty,
          variantId: input.variantId,
          variantTitle: input.variantTitle,
          productHandle: input.handle,
          productTitle: input.title,
          price: input.price,
          image: input.image,
        },
      ];
  set({ isOpen: true });
  if (state.mode === "public-json") return commitLocal(next);
  set({ cart: cartFromLines(next, state.cart.id, state.cart.checkoutUrl) });
  sync(() => addToCartAction({ variantId: input.variantId, quantity: qty }));
}

export function setQuantity(lineId: string, quantity: number) {
  const q = Math.max(0, Math.min(MAX_QTY, Math.floor(quantity)));
  const next = state.cart.lines.map((l) => (l.id === lineId ? { ...l, quantity: q } : l)).filter((l) => l.quantity > 0);
  if (state.mode === "public-json") return commitLocal(next);
  set({ cart: cartFromLines(next, state.cart.id, state.cart.checkoutUrl) });
  sync(() => updateCartLineAction({ lineId, quantity: q }));
}

export function removeLine(lineId: string) {
  const next = state.cart.lines.filter((l) => l.id !== lineId);
  if (state.mode === "public-json") return commitLocal(next);
  set({ cart: cartFromLines(next, state.cart.id, state.cart.checkoutUrl) });
  sync(() => removeCartLineAction({ lineId }));
}

export const openCart = () => set({ isOpen: true });
export const closeCart = () => set({ isOpen: false });
export const clearCartError = () => set({ error: null });
