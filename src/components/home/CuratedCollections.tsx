import Link from "next/link";
import Image from "next/image";
import type { FormSummary, MedicineCard } from "@/lib/medicines/types";
import { formatMoney } from "@/lib/shopify/format";
import styles from "./CuratedCollections.module.css";

interface CuratedCollectionsProps {
  cards: MedicineCard[];
  forms: FormSummary[];
}

export function CuratedCollections({ cards, forms }: CuratedCollectionsProps) {
  const displayCards = cards.slice(0, 6);
  const featuredForms = forms.slice(0, 5);

  return (
    <section className={styles.section} aria-labelledby="collections-heading">
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>The Centenary Pharmacopoeia</span>
            <h2 id="collections-heading" className={styles.title}>
              Signature Formulations
            </h2>
          </div>
          <div className={styles.headerActions}>
            <Link href="/store" className="btn btn--primary">
              View All 160+ Formulations →
            </Link>
          </div>
        </div>

        {/* Form Categories Quick Navigation */}
        <div className={styles.formNav} role="navigation" aria-label="Medicinal Forms">
          {featuredForms.map((f) => (
            <Link key={f.id} href={f.href} className={styles.formPill}>
              <span className={styles.formPillLabel}>{f.label}</span>
              <span className={styles.formPillCount}>{f.count}</span>
            </Link>
          ))}
          <Link href="/store" className={styles.formPillMore}>
            All Forms →
          </Link>
        </div>

        {/* Asymmetric Product Grid */}
        <div className={styles.grid}>
          {displayCards.map((c, i) => (
            <Link
              key={c.handle}
              href={`/products/${c.handle}`}
              className={styles.card}
              data-featured={i === 0}
            >
              <div className={styles.imageWrap}>
                {c.heroImage ? (
                  <Image
                    src={c.heroImage.url}
                    alt={c.name}
                    fill
                    sizes={
                      i === 0
                        ? "(min-width: 64rem) 50vw, 100vw"
                        : "(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw"
                    }
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder} />
                )}
                <span className={styles.formBadge}>{c.formLabel}</span>
              </div>

              <div className={styles.content}>
                <div className={styles.metaRow}>
                  <h3 className={styles.productName}>{c.name}</h3>
                  <span className={styles.price}>{formatMoney(c.price)}</span>
                </div>
                <div className={styles.footerRow}>
                  <span className={styles.packSize}>
                    {c.packLabel ?? "Standard apothecary packaging"}
                  </span>
                  <span className={styles.ctaLink}>View Formulation →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
