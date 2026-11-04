import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { Catalogue } from "@/components/store/Catalogue";
import { CatalogueSkeleton } from "@/components/store/CatalogueSkeleton";
import styles from "./store.module.css";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Store: Ayurveda medicines from AVVVS",
    description:
      "Classical and proprietary Ayurveda medicines from Arya Vaidya Vilasini Vaidya Sala, Kozhikode: thailam, choornam, arishtam, kashayam, lehyam and more, priced in rupees.",
    path: "/store",
  });
}

export default function StorePage({ searchParams }: PageProps<"/store">) {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>Store</h1>
        <p className="lead">Medicines from the Vaidya Sala, by collection and by form. Payment and delivery are handled at Shopify checkout.</p>
      </header>
      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
