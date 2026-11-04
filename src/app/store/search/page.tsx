import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, breadcrumbSchema, JsonLd } from "@/lib/seo";
import { Catalogue } from "@/components/store/Catalogue";
import { CatalogueSkeleton } from "@/components/store/CatalogueSkeleton";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import styles from "../store.module.css";

export const metadata: Metadata = buildMetadata({
  title: "Search Formulations · Dispensary Pharmacopoeia",
  description: "Search 165 authentic Ayurvedic formulations by name, therapeutic indication, classical text, or preparation vehicle.",
  path: "/store/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const crumbs = [
    { name: "Store", href: "/store" },
    { name: "Search Dispensary", href: "/store/search" },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={crumbs} />
      <header className={styles.head}>
        <h1 className={styles.title}>Dispensary Search</h1>
        <p className="lead">
          Browse and filter 165 classical and proprietary formulations compounded in Kozhikode.
        </p>
      </header>
      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            name: "Dispensary Search",
            url: "https://www.avvvs.com/store/search",
          },
          breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href }))),
        ]}
      />
    </div>
  );
}

