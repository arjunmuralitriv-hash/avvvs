import styles from "./Catalogue.module.css";

/** Shown in the static shell while the catalogue streams in. */
export function CatalogueSkeleton() {
  return (
    <div aria-busy="true">
      <p className={`label ${styles.skelNote}`} role="status">
        Loading the catalogue
      </p>
      <ul className={styles.skeleton} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} />
        ))}
      </ul>
    </div>
  );
}
