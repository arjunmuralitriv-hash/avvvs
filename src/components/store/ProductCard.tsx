import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { formatMoney, titleCase, typeLabel } from "@/lib/shopify/format";
import type { Product } from "@/lib/shopify/types";
import { lowestPrice } from "./catalogue-query";
import styles from "./ProductCard.module.css";

const CARD_SIZES = "(min-width: 90rem) 18vw, (min-width: 60rem) 25vw, (min-width: 40rem) 50vw, 100vw";

/** "₹130", or "From ₹130" when the variants are priced differently. */
export function priceLabel(p: Product): { text: string; from: boolean } {
  const prices = p.variants.map((v) => Number(v.price.amount));
  const min = lowestPrice(p);
  const from = new Set(prices).size > 1;
  return { text: formatMoney({ amount: String(min), currencyCode: p.variants[0]?.price.currencyCode ?? "INR" }), from };
}

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const title = titleCase(product.title);
  const image = product.featuredImage;
  const price = priceLabel(product);
  return (
    <li className={styles.card}>
      <Link href={`/products/${product.handle}`} className={styles.link}>
        <ViewTransition name={`product-${product.handle}`} share="morph" default="none">
          <div className={styles.media}>
            {image ? (
              <Image
                src={image.url}
                alt={image.altText || title}
                fill
                sizes={CARD_SIZES}
                className={styles.img}
                {...(eager ? { loading: "eager", fetchPriority: "high" } : {})}
              />
            ) : (
              <span className={styles.none}>No photograph yet</span>
            )}
          </div>
        </ViewTransition>
        <div className={styles.body}>
          <h3 className={styles.title}>{title}</h3>
          <p className="label">{typeLabel(product.productType)}</p>
          <p className={`${styles.price} num`}>
            {price.from ? <span className="label">From </span> : null}
            {price.text}
            {!product.availableForSale ? <span className={styles.out}> Out of stock</span> : null}
          </p>
        </div>
      </Link>
    </li>
  );
}
