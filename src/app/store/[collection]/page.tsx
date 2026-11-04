import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import { COLLECTION_ORDER, collectionLabel, getCollectionProducts } from "@/lib/shopify";
import { Catalogue } from "@/components/store/Catalogue";
import { CatalogueSkeleton } from "@/components/store/CatalogueSkeleton";
import styles from "../store.module.css";

const known = (h: string) => (COLLECTION_ORDER as readonly string[]).includes(h);

export function generateStaticParams() {
  return COLLECTION_ORDER.map((collection) => ({ collection }));
}

export async function generateMetadata({ params }: PageProps<"/store/[collection]">): Promise<Metadata> {
  const { collection } = await params;
  if (!known(collection)) return {};
  const n = (await getCollectionProducts(collection)).length;
  const label = collectionLabel(collection);
  return buildMetadata({
    title: `${label} medicines`,
    description: `${n} ${label.toLowerCase()} Ayurveda ${n === 1 ? "medicine" : "medicines"} from Arya Vaidya Vilasini Vaidya Sala, Kozhikode, priced in rupees.`,
    path: `/store/${collection}`,
  });
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/store/[collection]">) {
  const { collection } = await params;
  if (!known(collection)) notFound();
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        <h1>{collectionLabel(collection)}</h1>
        <p className="lead">The {collectionLabel(collection).toLowerCase()} collection of the Vaidya Sala store.</p>
      </header>
      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue collection={collection} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
