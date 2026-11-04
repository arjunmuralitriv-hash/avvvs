import Link from "next/link";
import Image from "next/image";
import type { FormSummary } from "@/lib/medicines/types";
import styles from "./FormIndex.module.css";

export function FormIndex({
  forms,
  variant = "full",
}: {
  forms: FormSummary[];
  variant?: "full" | "compact";
}) {
  return (
    <section className={styles.section} aria-labelledby="forms-heading">
      <div className={styles.leftCol}>
        <div className={styles.header}>
          <h2 id="forms-heading" className={styles.title}>
            {variant === "compact" ? "Other Forms" : "Classical & Proprietary Forms"}
          </h2>
          {variant !== "compact" && (
            <p className={styles.headerNote}>
              Preparations codified in classical Ayurvedic treatises &mdash; Ashtanga Hridaya, Sahasrayogam &mdash; and proprietary medicines compounded in our Kozhikode dispensary.
            </p>
          )}
        </div>
        {variant !== "compact" && (
          <div className={styles.plateCard}>
            <div className={styles.plateContainer}>
              <Image
                src="/plates/vitex-negundo-1024.webp"
                alt="Historical botanical engraving of Vitex negundo (Nirgundi / Karinochi)"
                fill
                sizes="(min-width: 60rem) 360px, 100vw"
                className={styles.plateImg}
              />
            </div>
            <div className={styles.plateMeta}>
              <span className={styles.plateTitle}>Hortus Malabaricus, 1678</span>
              <span className={styles.plateLatin}>Tab. 12: Vitex negundo (Nirgundi)</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.rightCol}>
        <ul className={styles.list}>
          {forms.map((f, i) => (
            <li key={f.id} className={styles.item}>
              <Link
                href={f.href}
                className={styles.row}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {variant === "full" && (
                  <div className={styles.thumbWrap}>
                    {f.thumb ? (
                      <Image
                        src={f.thumb.url}
                        alt=""
                        width={48}
                        height={48}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder} />
                    )}
                  </div>
                )}
                <div className={styles.info}>
                  <span className={styles.label}>{f.label}</span>
                  {f.gloss ? <span className={styles.gloss}>{f.gloss}</span> : null}
                </div>
                <div className={styles.counts}>
                  <span className={styles.count}>{f.count}</span>
                  <span className={styles.arrow} aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
