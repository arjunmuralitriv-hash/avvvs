import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      <ol>
        {items.map((it, i) => (
          <li key={it.href}>
            {i === items.length - 1 ? (
              <span aria-current="page">{it.name}</span>
            ) : (
              <Link href={it.href} className="link">
                {it.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
