"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/shopify/format";
import type { ProductImage, ShopMode, Variant } from "@/lib/shopify/types";
import { initCart } from "./cart-store";
import { useCart } from "./CartContext";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./BuyPanel.module.css";

type Props = {
  mode: ShopMode;
  handle: string;
  /** Display title (title case). */
  title: string;
  variants: Variant[];
  optionName: string;
  image: ProductImage | null;
};

export function BuyPanel({ mode, handle, title, variants, optionName, image }: Props) {
  const { add, open, error, pending } = useCart();
  const [variantId, setVariantId] = useState(() => (variants.find((v) => v.available) ?? variants[0])?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => initCart(mode), [mode]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  if (!variant) return null;

  const showVariantTitle = variants.length > 1;
  const onSale = variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount);
  const busy = pending > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant.available) return;
    add({
      variantId: variant.id,
      quantity,
      handle,
      title,
      variantTitle: variant.title,
      price: variant.price,
      image: variant.image ?? image,
    });
    setAdded(`Added ${quantity} to your cart.`);
    setQuantity(1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(null), 6000);
  };

  return (
    <form className={styles.panel} onSubmit={submit} aria-busy={busy || undefined}>
      <p className={`${styles.price} num`}>
        {onSale ? (
          <>
            <s className={styles.was}>
              <span className="visually-hidden">Was </span>
              {formatMoney(variant.compareAtPrice!)}
            </s>{" "}
          </>
        ) : null}
        <span className="visually-hidden">Price </span>
        {formatMoney(variant.price)}
      </p>

      {showVariantTitle ? (
        <fieldset className={styles.variants}>
          <legend className="label">{optionName}</legend>
          <div className={styles.options}>
            {variants.map((v) => (
              <label key={v.id} className={styles.option} data-unavailable={!v.available || undefined}>
                <input type="radio" name="variant" value={v.id} checked={v.id === variant.id} onChange={() => setVariantId(v.id)} className="visually-hidden" />
                <span>{v.title}</span>
                {!v.available ? <span className="label"> Out of stock</span> : null}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <QuantityStepper value={quantity} onChange={setQuantity} name={title} label="Quantity" min={1} max={99} disabled={!variant.available} />

      <button type="submit" className="btn btn--primary" disabled={!variant.available} aria-busy={busy || undefined}>
        {!variant.available ? "Out of stock" : busy ? "Adding to cart" : "Add to cart"}
      </button>

      <div className={styles.feedback} aria-live="polite">
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : added ? (
          <p className={styles.success}>
            {added}{" "}
            <button type="button" className={`${styles.viewCart} link`} onClick={open}>
              View cart
            </button>
          </p>
        ) : null}
      </div>
    </form>
  );
}
