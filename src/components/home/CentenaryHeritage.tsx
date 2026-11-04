import styles from "./CentenaryHeritage.module.css";
import Link from "next/link";

export function CentenaryHeritage() {
  return (
    <section className={styles.section} aria-labelledby="heritage-heading">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.leadCol}>
            <span className={styles.eyebrow}>Est. 1921 · Kozhikode, Malabar</span>
            <h2 id="heritage-heading" className={styles.title}>
              The Centenary House of Classical Ayurveda
            </h2>
            <p className={styles.lead}>
              Founded over a century ago under the personal counsel of sage Sree Narayana Guru,
              Arya Vaidya Vilasini Vaidya Sala preserves the sovereign medicinal traditions of Kerala.
            </p>
            <p className={styles.description}>
              From the rainforest canopy of the Western Ghats to our GMP-certified compounding house
              in Kozhikode, every preparation honors the foundational canons of the <i>Ashtanga Hridaya</i>{" "}
              and <i>Sahasrayogam</i>.
            </p>
            <div className={styles.action}>
              <Link href="/about" className="btn btn--primary">
                Read the Centenary Chronicle →
              </Link>
            </div>
          </div>

          <div className={styles.pillarsCol}>
            <div className={styles.pillar}>
              <span className={styles.pillarNum}>01</span>
              <div className={styles.pillarContent}>
                <h3 className={styles.pillarTitle}>Botanical Sovereignty</h3>
                <p className={styles.pillarDesc}>
                  Wild-crafted herbs, roots, and freshly expressed sesame oils harvested at peak lunar potency
                  across Kerala&apos;s biodiversity corridor.
                </p>
              </div>
            </div>

            <div className={styles.pillar}>
              <span className={styles.pillarNum}>02</span>
              <div className={styles.pillarContent}>
                <h3 className={styles.pillarTitle}>Uruli Bell-Metal Compounding</h3>
                <p className={styles.pillarDesc}>
                  Slow, multi-day simmer in traditional hand-beaten bronze vessels over aromatic medicinal woods,
                  locking in heat-sensitive phytonutrients.
                </p>
              </div>
            </div>

            <div className={styles.pillar}>
              <span className={styles.pillarNum}>03</span>
              <div className={styles.pillarContent}>
                <h3 className={styles.pillarTitle}>Absolute Scriptural Fidelity</h3>
                <p className={styles.pillarDesc}>
                  Over 300 formulations prepared without artificial binding agents, parabens, petroleum derivatives,
                  or synthetic fragrances.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
