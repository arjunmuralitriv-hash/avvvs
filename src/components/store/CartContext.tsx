"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { ShopMode } from "@/lib/shopify/types";
import { addToCart, closeCart, initCart, openCart, removeLine, setQuantity, useCartState } from "./cart-store";

const ModeContext = createContext<ShopMode | null>(null);

/** Starts the cart store for this storefront mode. The store itself is module-level, so it also works without this provider. */
export function CartContextProvider({ mode, children }: { mode: ShopMode; children: ReactNode }) {
  useEffect(() => initCart(mode), [mode]);
  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>;
}

export function useCart() {
  const state = useCartState();
  const mode = useContext(ModeContext);
  return { ...state, mode: mode ?? state.mode, add: addToCart, setQuantity, remove: removeLine, open: openCart, close: closeCart };
}
