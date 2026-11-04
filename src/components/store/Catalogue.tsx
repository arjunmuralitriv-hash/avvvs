import Link from "next/link";
import { JsonLd, abs } from "@/lib/seo";
import { COLLECTION_ORDER, collectionLabel, getProducts } from "@/lib/shopify";
import { titleCase, typeLabel } from "@/lib/shopify/format";
import { deriveForm, FORMS } from "@/lib/medicines/forms";
import type { FormId } from "@/lib/medicines/types";
import { buildHref, hasFilters, matchesSearch, PAGE_SIZE, parseQuery, sortProducts, DEFAULT_QUERY, type CatalogueQuery } from "./catalogue-query";
import { CatalogueControls } from "./CatalogueControls";
import { LedgerTable } from "./LedgerTable";
import { ProductCard } from "./ProductCard";
import styles from "./Catalogue.module.css";

type Props = {
  /** Collection handle, or undefined for the whole store. */
  collection?: string;
  /** Form id, e.g. "thailam", "kashayam". */
  form?: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** The catalogue body. Server-rendered from the URL: collection tabs, form chips, controls, results, pages. */
export async function Catalogue({ collection, form, searchParams }: Props) {
  const query = parseQuery(await searchParams);
  const basePath = form ? `/store/${form}` : collection ? `/store/${collection}` : "/store";
  const all = await getProducts();

  const baseSet = form
    ? all.filter((p) => deriveForm(p.productType, p.title) === form)
    : collection
    ? all.filter((p) => p.collections.includes(collection))
    : all;
  const searched = query.q ? baseSet.filter((p) => matchesSearch(p, query.q)) : baseSet;

  // Form chips count the search results, so the numbers always match what a click will show.
  const typeCounts = new Map<string, number>();
  for (const p of searched) typeCounts.set(p.productType, (typeCounts.get(p.productType) ?? 0) + 1);
  const types = [...typeCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const matched = sortProducts(query.type ? searched.filter((p) => p.productType.toUpperCase() === query.type) : searched, query.sort);
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const shown = matched.slice(start, start + PAGE_SIZE);
  const q: CatalogueQuery = { ...query, page };

  const formDef = form ? FORMS[form as FormId] : null;
  const where = formDef ? `the ${formDef.label} preparations` : collection ? `the ${collectionLabel(collection)} collection` : "the store";
  const listName = formDef ? `${formDef.plural} (${formDef.label})` : collection ? `${collectionLabel(collection)} medicines` : "Medicines";
  const noun = (n: number) => (n === 1 ? "medicine" : "medicines");
  const summary = hasFilters(query)
    ? `Showing ${matched.length} of ${baseSet.length} ${noun(baseSet.length)} in ${where}`
    : `${matched.length} ${noun(matched.length)} in ${where}`;

  return (
    <>
      <nav aria-label="Collections" className={styles.tabs}>
        <TabLink href={buildHref("/store", { ...DEFAULT_QUERY, q: query.q, sort: query.sort, view: query.view })} current={!collection} label="All" count={all.length} />
        {COLLECTION_ORDER.map((handle) => (
          <TabLink
            key={handle}
            href={buildHref(`/store/${handle}`, { ...DEFAULT_QUERY, q: query.q, sort: query.sort, view: query.view })}
            current={collection === handle}
            label={collectionLabel(handle)}
            count={all.filter((p) => p.collections.includes(handle)).length}
          />
        ))}
      </nav>

      <div className={styles.controls}>
        <CatalogueControls basePath={basePath} query={q} />
      </div>

      {types.length > 1 || query.type ? (
        <nav aria-label="Filter by form" className={styles.chips}>
          <Link href={buildHref(basePath, q, { type: "", page: 1 })} className="chip" data-active={!query.type || undefined} aria-current={!query.type ? "true" : undefined}>
            All forms {searched.length}
          </Link>
          {types.map(([type, n]) => (
            <Link key={type} href={buildHref(basePath, q, { type: type.toUpperCase(), page: 1 })} className="chip" data-active={query.type === type.toUpperCase() || undefined} aria-current={query.type === type.toUpperCase() ? "true" : undefined}>
              {typeLabel(type)} {n}
            </Link>
          ))}
          {query.type && !typeCounts.has(query.type) ? (
            <span className="chip" data-active="true">
              {typeLabel(query.type)} 0
            </span>
          ) : null}
        </nav>
      ) : null}

      <div className={styles.bar}>
        <p className={`${styles.count} num`} role="status" aria-live="polite">
          {summary}
        </p>
        <div className={styles.views} role="group" aria-label="View">
          {(["grid", "ledger"] as const).map((v) => (
            <Link key={v} href={buildHref(basePath, q, { view: v, page: 1 })} className={styles.view} aria-current={q.view === v ? "true" : undefined} scroll={false}>
              {v === "grid" ? "Images" : "Ledger"}
            </Link>
          ))}
          {hasFilters(query) ? (
            <Link href={buildHref(basePath, { ...DEFAULT_QUERY, sort: query.sort, view: query.view })} className={`${styles.view} link`}>
              Clear filters
            </Link>
          ) : null}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <p className="lead">{baseSet.length === 0 ? `No medicines are listed in ${where} at the moment.` : "No medicines match these filters."}</p>
          {baseSet.length > 0 ? (
            <Link href={buildHref(basePath, { ...DEFAULT_QUERY, sort: query.sort, view: query.view })} className="btn">
              Clear filters
            </Link>
          ) : (
            <Link href="/store" className="btn">
              See the whole store
            </Link>
          )}
        </div>
      ) : q.view === "ledger" ? (
        <LedgerTable products={shown} startAt={start + 1} caption={summary} />
      ) : (
        <ul className={styles.grid}>
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} eager={page === 1 && i < 4} />
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages" className={styles.pages}>
          {page > 1 ? (
            <Link href={buildHref(basePath, q, { page: page - 1 })} className="btn" rel="prev">
              Previous
            </Link>
          ) : null}
          <span className="num">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={buildHref(basePath, q, { page: page + 1 })} className="btn" rel="next">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${listName}${query.type ? `, ${typeLabel(query.type)}` : ""}`,
          numberOfItems: matched.length,
          itemListElement: shown.map((p, i) => ({ "@type": "ListItem", position: start + i + 1, url: abs(`/products/${p.handle}`), name: titleCase(p.title) })),
        }}
      />
    </>
  );
}

function TabLink({ href, current, label, count }: { href: string; current: boolean; label: string; count: number }) {
  return (
    <Link href={href} className={styles.tab} aria-current={current ? "page" : undefined}>
      {label} <span className={`${styles.tabCount} num`}>{count}</span>
    </Link>
  );
}
