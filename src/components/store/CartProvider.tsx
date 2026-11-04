import type { ReactNode } from "react";
import { shopMode } from "@/lib/shopify";
import { CartContextProvider } from "./CartContext";

/**
 * Wrap the body content in layout.tsx with this so the cart starts loading before the nav mounts:
 *   <body><CartProvider> ...Nav, main, Footer... </CartProvider></body>
 * It is optional: CartButton and AddToCart start the same module-level store themselves.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  return <CartContextProvider mode={shopMode()}>{children}</CartContextProvider>;
}
