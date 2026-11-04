import Link from "next/link";
import styles from "./StoreIndexLinks.module.css";

export function StoreIndexLinks({
  totalCount,
  proprietaryCount,
}: {
  totalCount: number;
  proprietaryCount: number;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.grid}>
        <Link href="/store/search" className={styles.cardLink}>
          <div className={styles.cardContent}>
            <span className={styles.cardCategory}>Complete Pharmacopoeia</span>
            <h3 className={styles.cardTitle}>Browse all {totalCount} classical formulations</h3>
            <p className={styles.cardDesc}>
              Search the full dispensary by therapeutic application, classical citation (Ashtanga Hridaya, Sahasrayogam), or preparation vehicle.
            </p>
          </div>
          <span className={styles.cardAction}>
            View complete index &rarr;
          </span>
        </Link>

        <Link href="/store/proprietary" className={styles.cardLink}>
          <div className={styles.cardContent}>
            <span className={styles.cardCategory}>Laboratory Formulations</span>
            <h3 className={styles.cardTitle}>Explore {proprietaryCount} proprietary medicines</h3>
            <p className={styles.cardDesc}>
              Specialized therapeutic medicines developed, tested, and refined across four generations of vaidyans in Kozhikode.
            </p>
          </div>
          <span className={styles.cardAction}>
            Explore proprietary line &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
