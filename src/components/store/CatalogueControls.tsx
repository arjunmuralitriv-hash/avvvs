"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buildHref, SORTS, type CatalogueQuery, type SortKey } from "./catalogue-query";
import styles from "./CatalogueControls.module.css";

/**
 * Search and sort. Everything else on the page is rendered on the server; these two controls only rewrite the URL.
 * Without JavaScript the form still works as a plain GET.
 */
export function CatalogueControls({ basePath, query }: { basePath: string; query: CatalogueQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(query.q);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pushed, setPushed] = useState(query.q);

  // Follow the URL when it changes elsewhere (Clear filters, browser back), but never overwrite what is being typed.
  if (query.q !== pushed && query.q !== text.trim().replace(/\s+/g, " ")) {
    setPushed(query.q);
    setText(query.q);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (change: Partial<CatalogueQuery>) => {
    startTransition(() => router.replace(buildHref(basePath, query, { ...change, page: 1 }), { scroll: false }));
  };

  const search = (value: string) => {
    const q = value.trim().replace(/\s+/g, " ");
    if (q === pushed) return;
    setPushed(q);
    go({ q });
  };

  return (
    <form
      role="search"
      action={basePath}
      method="get"
      className={styles.form}
      aria-busy={pending || undefined}
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer.current);
        search(text);
      }}
    >
      {query.type ? <input type="hidden" name="type" value={query.type} /> : null}
      {query.view !== "grid" ? <input type="hidden" name="view" value={query.view} /> : null}

      <div className={styles.field}>
        <label htmlFor="store-search" className="label">Search medicines</label>
        <div className={styles.searchRow}>
          <input
            id="store-search"
            name="q"
            type="search"
            className={styles.input}
            value={text}
            maxLength={80}
            autoComplete="off"
            placeholder="Name, form or use"
            onChange={(e) => {
              setText(e.target.value);
              clearTimeout(timer.current);
              const value = e.target.value;
              timer.current = setTimeout(() => search(value), 350);
            }}
          />
          <button type="submit" className="btn" aria-busy={pending || undefined}>
            Search
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="store-sort" className="label">Sort by</label>
        <select id="store-sort" name="sort" className={styles.input} value={query.sort} onChange={(e) => go({ sort: e.target.value as SortKey })}>
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <p className="visually-hidden" role="status">
        {pending ? "Updating results" : ""}
      </p>
    </form>
  );
}
