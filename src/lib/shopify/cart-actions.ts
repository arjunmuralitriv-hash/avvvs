"use server";
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import { cartApi } from "./index";
import type { Cart } from "./types";

// Storefront-mode cart. The browser holds only the cart id, in an httpOnly cookie; every change is a server action.
// In fallback mode (no token) these are never called: the cart lives in localStorage on the client.

const COOKIE = "avvvs_cart";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export type CartResult = { ok: true; cart: Cart | null } | { ok: false; error: string };

const variantId = z.string().min(1).max(200);
const qty = z.number().int().min(0).max(99);

async function remember(cart: Cart) {
  if (!cart.id) return;
  (await cookies()).set(COOKIE, cart.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: THIRTY_DAYS });
}

async function run(fn: (api: NonNullable<ReturnType<typeof cartApi>>, cartId: string | undefined) => Promise<Cart | null>): Promise<CartResult> {
  const api = cartApi();
  if (!api) return { ok: false, error: "The cart service is not configured." };
  try {
    const jar = await cookies();
    const cart = await fn(api, jar.get(COOKIE)?.value);
    if (cart) await remember(cart);
    return { ok: true, cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong with the cart." };
  }
}

export async function getCartAction(): Promise<CartResult> {
  return run(async (api, id) => (id ? api.get(id) : null));
}

export async function addToCartAction(input: { variantId: string; quantity: number }): Promise<CartResult> {
  const parsed = z.object({ variantId, quantity: qty.min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "That item could not be added." };
  const line = parsed.data;
  return run(async (api, id) => {
    if (id) {
      try {
        return await api.addLines(id, [line]);
      } catch {
        // The saved cart expired or was completed at checkout: start a new one.
      }
    }
    return api.create([line]);
  });
}

export async function updateCartLineAction(input: { lineId: string; quantity: number }): Promise<CartResult> {
  const parsed = z.object({ lineId: variantId, quantity: qty }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "That quantity is not valid." };
  const { lineId, quantity } = parsed.data;
  return run(async (api, id) => {
    if (!id) return null;
    return quantity === 0 ? api.removeLines(id, [lineId]) : api.updateLines(id, [{ id: lineId, quantity }]);
  });
}

export async function removeCartLineAction(input: { lineId: string }): Promise<CartResult> {
  const parsed = z.object({ lineId: variantId }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "That item could not be removed." };
  return run(async (api, id) => (id ? api.removeLines(id, [parsed.data.lineId]) : null));
}
