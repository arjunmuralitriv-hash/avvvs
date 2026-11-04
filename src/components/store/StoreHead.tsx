import Image from "next/image";
import styles from "./StoreHead.module.css";

export function StoreHead({ count }: { count: number }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.text}>
        <div className={styles.heritageMark} lang="ml">
          ആര്യ വൈദ്യ വിലാസിനി വൈദ്യശാല &middot; കോഴിക്കോട് &middot; 1921
        </div>
        <h1 className={styles.h1}>The Classical Pharmacopoeia</h1>
        <p className={styles.lead}>
          {count} authentic classical and proprietary formulations codified from the Ashtanga Hridaya.
          Compounded with native botanicals in Kozhikode since 1921.
        </p>
      </div>
      <div className={styles.visualCol}>
        <div className={styles.plateShowcase}>
          <Image
            src="/plates/curcuma-longa-1024.webp"
            alt="Historical botanical engraving of Curcuma longa (Haridra)"
            fill
            sizes="(min-width: 60rem) 460px, 100vw"
            className={styles.plateImage}
          />
          <div className={styles.plateCaption}>
            <span className={styles.plateSource}>Hortus Malabaricus 1678</span>
            <span className={styles.plateLatin}>Tab. 11: Curcuma longa (Haridra)</span>
          </div>
        </div>
        <form action="/store/search" method="GET" className={styles.searchForm}>
          <label htmlFor="store-search" className="visually-hidden">
            Search medicines
          </label>
          <input
            id="store-search"
            type="search"
            name="q"
            placeholder="Search formulation, herb or form..."
            className={styles.input}
          />
          <button type="submit" className={styles.submitBtn} aria-label="Search dispensary">
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
