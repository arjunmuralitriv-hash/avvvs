import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buildMetadata, breadcrumbSchema, JsonLd } from "@/lib/seo";
import { COLLECTION_ORDER, collectionLabel, getCollectionProducts } from "@/lib/shopify";
import { FORM_ORDER, FORMS } from "@/lib/medicines/forms";
import type { FormId } from "@/lib/medicines/types";
import { Catalogue } from "@/components/store/Catalogue";
import { CatalogueSkeleton } from "@/components/store/CatalogueSkeleton";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import styles from "../store.module.css";

const isCollection = (h: string) => (COLLECTION_ORDER as readonly string[]).includes(h);
const isForm = (h: string) => (FORM_ORDER as readonly string[]).includes(h);

export function generateStaticParams() {
  const collections = COLLECTION_ORDER.map((collection) => ({ collection }));
  const forms = FORM_ORDER.map((collection) => ({ collection }));
  return [...collections, ...forms];
}

export async function generateMetadata({ params }: PageProps<"/store/[collection]">): Promise<Metadata> {
  const { collection } = await params;
  if (isForm(collection)) {
    const formDef = FORMS[collection as FormId];
    return buildMetadata({
      title: `${formDef.plural} (${formDef.label}) · Formulations`,
      description: `Authentic classical Ayurvedic ${formDef.label.toLowerCase()} preparations compounded in Kozhikode since 1921. Codified from Ashtanga Hridaya and Sahasrayogam.`,
      path: `/store/${collection}`,
    });
  }

  if (isCollection(collection)) {
    const n = (await getCollectionProducts(collection)).length;
    const label = collectionLabel(collection);
    return buildMetadata({
      title: `${label} Medicines`,
      description: `${n} ${label.toLowerCase()} Ayurveda ${n === 1 ? "medicine" : "medicines"} from Arya Vaidya Vilasini Vaidya Sala, Kozhikode, priced in rupees.`,
      path: `/store/${collection}`,
    });
  }

  return {};
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/store/[collection]">) {
  const { collection } = await params;
  const isF = isForm(collection);
  const isC = isCollection(collection);

  if (!isF && !isC) notFound();

  let title = "";
  let lead = "";
  if (isF) {
    const def = FORMS[collection as FormId];
    title = `${def.plural} (${def.label})`;
    lead = def.gloss
      ? `Classical ${def.label.toLowerCase()} preparations (${def.gloss}) codified in traditional Ayurvedic pharmacopoeia.`
      : `Classical ${def.label.toLowerCase()} preparations compounded in Kozhikode.`;
  } else {
    title = `${collectionLabel(collection)} Medicines`;
    lead = `The ${collectionLabel(collection).toLowerCase()} collection of Arya Vaidya Vilasini Vaidya Sala.`;
  }

  const crumbs = [
    { name: "Store", href: "/store" },
    { name: title, href: `/store/${collection}` },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={crumbs} />
      <header className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        <p className="lead">{lead}</p>
      </header>
      <Suspense fallback={<CatalogueSkeleton />}>
        {isF ? (
          <Catalogue form={collection} searchParams={searchParams} />
        ) : (
          <Catalogue collection={collection} searchParams={searchParams} />
        )}
      </Suspense>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            url: `https://www.avvvs.com/store/${collection}`,
          },
          breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href }))),
        ]}
      />
    </div>
  );
}
