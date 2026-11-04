// Pure helpers shared by server and client code. No server-only imports here.
import type { Cart, CartLine, Money } from "./types";

export const STORE_ORIGIN = "https://avvvsglobal.com";
export const CURRENCY = "INR";

const inr0 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMoney(m: Money): string {
  const n = Number(m.amount);
  if (!Number.isFinite(n)) return "";
  return Number.isInteger(n) ? inr0.format(n) : inr2.format(n);
}

export const money = (n: number): Money => ({ amount: n.toFixed(2), currencyCode: CURRENCY });

/** "gid://shopify/ProductVariant/123" -> "123"; "123" -> "123". */
export const numericId = (id: string) => id.split("/").pop() ?? id;

const SMALL = new Set(["and", "of", "the", "with", "in", "for", "to", "a"]);

/** "DHANWANTHARAM THAILAM (500ML)" -> "Dhanwantharam Thailam (500ml)". Shopify titles are ALL CAPS; the data keeps the original. */
export function titleCase(s: string): string {
  const words = s.trim().toLowerCase().split(/(\s+)/);
  let first = true;
  return words
    .map((w) => {
      if (!w.trim()) return w;
      const lead = w.search(/[a-z0-9]/);
      const out = lead < 0 || /[0-9]/.test(w[lead]) ? w : SMALL.has(w) && !first ? w : w.slice(0, lead) + w[lead].toUpperCase() + w.slice(lead + 1);
      first = false;
      return out;
    })
    .join("");
}

/** "THAILAM" -> "Thailam". Product types are single words, sentence case. */
export const typeLabel = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : "Other");

export function sumMoney(lines: CartLine[]): Money {
  const total = lines.reduce((s, l) => s + Number(l.price.amount) * l.quantity, 0);
  return money(total);
}

/**
 * Shopify cart permalink: https://avvvsglobal.com/cart/{variantId}:{qty},{variantId}:{qty}
 * It opens Shopify's real checkout with those lines. Returns null for an empty cart.
 */
export function cartPermalink(lines: { variantId: string; quantity: number }[], origin = STORE_ORIGIN): string | null {
  const parts = lines.filter((l) => l.quantity > 0).map((l) => `${numericId(l.variantId)}:${l.quantity}`);
  return parts.length ? `${origin}/cart/${parts.join(",")}` : null;
}

export function emptyCart(): Cart {
  return { id: null, checkoutUrl: null, totalQuantity: 0, subtotal: money(0), lines: [] };
}

/** Rebuilds the derived fields of a client-side cart from its lines. */
export function cartFromLines(lines: CartLine[], id: string | null = null, checkoutUrl?: string | null): Cart {
  const kept = lines.filter((l) => l.quantity > 0);
  return {
    id,
    checkoutUrl: checkoutUrl === undefined ? cartPermalink(kept) : checkoutUrl,
    totalQuantity: kept.reduce((s, l) => s + l.quantity, 0),
    subtotal: sumMoney(kept),
    lines: kept,
  };
}
