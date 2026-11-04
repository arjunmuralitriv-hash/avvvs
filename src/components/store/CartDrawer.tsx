"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatMoney, titleCase } from "@/lib/shopify/format";
import type { CartLine } from "@/lib/shopify/types";
import { useCart } from "./CartContext";
import { clearCartError } from "./cart-store";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./CartDrawer.module.css";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EASE = [0.16, 1, 0.3, 1] as const; // --ease-out
const noopSubscribe = () => () => {};

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { cart, isOpen, error, pending, setQuantity, remove } = useCart();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // Lock page scroll, move focus into the dialog, close on Escape, keep Tab inside.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab" && panel) {
        const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !panel.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = previous;
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const panelMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" }, transition: { duration: 0.42, ease: EASE } };

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className={styles.root} key="cart">
          <motion.div
            className={styles.scrim}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.22 }}
          />
          <motion.aside ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="cart-title" data-lenis-prevent {...panelMotion}>
            <header className={styles.head}>
              <h2 id="cart-title" className={styles.title}>
                Cart
              </h2>
              <button type="button" className="btn" onClick={onClose} data-autofocus>
                Close
              </button>
            </header>

            {error ? (
              <p className={styles.error} role="alert">
                {error}{" "}
                <button type="button" className={`${styles.dismiss} link`} onClick={clearCartError}>
                  Dismiss
                </button>
              </p>
            ) : null}

            {cart.lines.length === 0 ? (
              <div className={styles.empty}>
                <p className="lead">Your cart is empty.</p>
                <Link href="/store" className="btn btn--primary" onClick={onClose}>
                  Browse the store
                </Link>
              </div>
            ) : (
              <>
                <ul className={styles.lines}>
                  {cart.lines.map((line) => (
                    <Line key={line.id} line={line} onClose={onClose} onQuantity={(q) => setQuantity(line.id, q)} onRemove={() => remove(line.id)} />
                  ))}
                </ul>
                <footer className={styles.foot}>
                  <div className={styles.subtotal}>
                    <span>Subtotal</span>
                    <strong className="num">{formatMoney(cart.subtotal)}</strong>
                  </div>
                  <p className="label">Shipping and tax are worked out at checkout.</p>
                  {pending > 0 || !cart.checkoutUrl ? (
                    <span className="btn btn--primary" role="link" aria-disabled="true" aria-busy={pending > 0 || undefined}>
                      {pending > 0 ? "Updating cart" : "Checkout"}
                    </span>
                  ) : (
                    <a className="btn btn--primary" href={cart.checkoutUrl}>
                      Checkout
                    </a>
                  )}
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function Line({ line, onQuantity, onRemove, onClose }: { line: CartLine; onQuantity: (q: number) => void; onRemove: () => void; onClose: () => void }) {
  const title = titleCase(line.productTitle);
  const syncing = line.id.startsWith("pending:");
  const variant = line.variantTitle && line.variantTitle !== "Default Title" ? line.variantTitle : null;
  return (
    <li className={styles.line} aria-busy={syncing || undefined}>
      <div className={styles.thumb}>
        {line.image ? <Image src={line.image.url} alt="" width={96} height={96} sizes="96px" className={styles.thumbImg} /> : null}
      </div>
      <div className={styles.info}>
        <Link href={`/products/${line.productHandle}`} className={`${styles.name} link`} onClick={onClose}>
          {title}
        </Link>
        {variant ? <span className="label">{variant}</span> : null}
        <span className="label num">{formatMoney(line.price)} each</span>
        <div className={styles.row}>
          <QuantityStepper value={line.quantity} onChange={onQuantity} name={title} min={1} disabled={syncing} busy={syncing} />
          <button type="button" className={`${styles.remove} link`} onClick={onRemove} disabled={syncing} aria-label={`Remove ${title}`}>
            Remove
          </button>
        </div>
      </div>
      <strong className={`${styles.total} num`}>{formatMoney({ amount: String(Number(line.price.amount) * line.quantity), currencyCode: line.price.currencyCode })}</strong>
    </li>
  );
}
