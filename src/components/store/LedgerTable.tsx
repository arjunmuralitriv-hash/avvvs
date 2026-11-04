import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { titleCase, typeLabel } from "@/lib/shopify/format";
import type { Product } from "@/lib/shopify/types";
import { priceLabel } from "./ProductCard";
import styles from "./LedgerTable.module.css";

/** The apothecary ledger: a ruled index of the same products as the grid. */
export function LedgerTable({ products, caption, startAt }: { products: Product[]; caption: string; startAt: number }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={`${styles.no} num`}>No.</th>
            <th scope="col">Medicine</th>
            <th scope="col" className={styles.form}>Form</th>
            <th scope="col" className={styles.price}>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const title = titleCase(p.title);
            const price = priceLabel(p);
            return (
              <tr key={p.id}>
                <td className={`${styles.no} num`}>{startAt + i}</td>
                <th scope="row" className={styles.name}>
                  <Link href={`/products/${p.handle}`} className={styles.link}>
                    <ViewTransition name={`product-${p.handle}`} share="morph" default="none">
                      <span className={styles.thumb}>
                        {p.featuredImage ? <Image src={p.featuredImage.url} alt="" fill sizes="48px" className={styles.img} /> : null}
                      </span>
                    </ViewTransition>
                    <span className="link">{title}</span>
                  </Link>
                </th>
                <td className={styles.form}>{typeLabel(p.productType)}</td>
                <td className={`${styles.price} num`}>
                  {price.from ? <span className="label">From </span> : null}
                  {price.text}
                  {!p.availableForSale ? <span className={styles.out}> Out of stock</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
