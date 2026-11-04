import Link from "next/link";
import styles from "./content.module.css";

export type Crumb = { name: string; path: string };

/** Visible breadcrumb trail. The last item is the current page. Pair with breadcrumbSchema() for JSON-LD. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      <ol>
        {items.map((it, i) => (
          <li key={it.path}>
            {i === items.length - 1 ? (
              <span aria-current="page">{it.name}</span>
            ) : (
              <Link className="link" href={it.path}>
                {it.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
