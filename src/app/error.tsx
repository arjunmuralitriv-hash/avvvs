"use client";

import Link from "next/link";
import styles from "./status.module.css";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={`container ${styles.wrap}`}>
      <h1>Something went wrong</h1>
      <p className={styles.lead}>This page could not be shown. Try again, or use one of the links below.</p>
      <ul className={styles.links}>
        <li><button type="button" className="btn btn--primary" onClick={() => reset()}>Try again</button></li>
        <li><Link className="btn" href="/">Home</Link></li>
        <li><Link className="btn" href="/store">Store</Link></li>
        <li><Link className="btn" href="/consultation">Book a consultation</Link></li>
      </ul>
    </div>
  );
}
