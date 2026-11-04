import Link from "next/link";
import Image from "next/image";
import type { MedicineCard } from "@/lib/medicines/types";
import { formatMoney } from "@/lib/shopify/format";
import styles from "./SignatureBand.module.css";

export function SignatureBand({ cards }: { cards: MedicineCard[] }) {
  if (cards.length === 0) return null;

  const displayCards = cards.slice(0, 6);

  return (
    <section className={styles.section} aria-labelledby="signature-heading">
      <div className={styles.header}>
        <h2 id="signature-heading" className={styles.title}>
          Signature Formulations
        </h2>
        <span className={styles.subtitle}>
          Centenary preparations handcrafted in Kozhikode
        </span>
      </div>
      <div className={styles.grid}>
        {displayCards.map((c, i) => (
          <Link
            key={c.handle}
            href={`/products/${c.handle}`}
            className={styles.card}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={styles.imageContainer}>
              {c.heroImage ? (
                <Image
                  src={c.heroImage.url}
                  alt={c.name}
                  fill
                  sizes="(min-width: 60rem) 33vw, (min-width: 40rem) 50vw, 100vw"
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder} />
              )}
            </div>
            <div className={styles.meta}>
              <span className={styles.formTag}>{c.formLabel}</span>
              <h3 className={styles.name}>{c.name}</h3>
              <div className={styles.details}>
                <span className={styles.pack}>
                  {c.packLabel ?? "Standard pack"}
                </span>
                <span className={styles.price}>{formatMoney(c.price)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
