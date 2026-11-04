import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import styles from "./status.module.css";

export const metadata = buildMetadata({
  title: "Page not found",
  description: "This page is not on the AVVVS website.",
  path: "/",
  noindex: true,
});

export default function NotFound() {
  return (
    <div className={`container ${styles.wrap}`}>
      <h1>Page not found</h1>
      <p className={styles.lead}>This page is not on our website. It may have moved, or the address may have a typing error.</p>
      <ul className={styles.links}>
        <li><Link className="btn btn--primary" href="/">Home</Link></li>
        <li><Link className="btn" href="/store">Store</Link></li>
        <li><Link className="btn" href="/consultation">Book a consultation</Link></li>
      </ul>
    </div>
  );
}
