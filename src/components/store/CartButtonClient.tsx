"use client";

import { useEffect, useRef } from "react";
import type { ShopMode } from "@/lib/shopify/types";
import { CartDrawer } from "./CartDrawer";
import { initCart } from "./cart-store";
import { useCart } from "./CartContext";
import styles from "./CartButton.module.css";

export function CartButtonClient({ mode }: { mode: ShopMode }) {
  const { cart, isOpen, open, close, pending, ready } = useCart();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => initCart(mode), [mode]);

  // Focus returns to the button when the drawer closes.
  useEffect(() => {
    if (wasOpen.current && !isOpen) buttonRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  const count = cart.totalQuantity;
  const spoken = ready ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`btn ${styles.button}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-busy={pending > 0 || undefined}
        aria-label={spoken}
        onClick={open}
      >
        <span>Cart</span>
        <span className={`${styles.count} num`} data-empty={count === 0 || undefined} aria-hidden="true">
          {count}
        </span>
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {ready ? spoken : ""}
      </span>
      <CartDrawer onClose={close} />
    </>
  );
}
