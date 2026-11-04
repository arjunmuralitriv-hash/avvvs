// Cart trigger for the nav: a button with the item count that opens the slide-over cart.
// Contract (unchanged): named export `CartButton`, no props, fits in `.nav__actions`.
import { shopMode } from "@/lib/shopify";
import { CartButtonClient } from "./CartButtonClient";

export function CartButton() {
  return <CartButtonClient mode={shopMode()} />;
}
