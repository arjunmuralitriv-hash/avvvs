import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, abs, breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { COLLECTION_ORDER, collectionLabel, getProduct, getProducts, getRecommendations, shopMode } from "@/lib/shopify";
import { formatMoney, titleCase, typeLabel } from "@/lib/shopify/format";
import type { Product } from "@/lib/shopify/types";
import { BuyPanel } from "@/components/store/BuyPanel";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import styles from "./product.module.css";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ handle: p.handle }));
}

const summary = (p: Product) => {
  const text = p.description.replace(/\s+/g, " ").trim();
  const lowest = formatMoney(p.variants.reduce((a, v) => (Number(v.price.amount) < Number(a.amount) ? v.price : a), p.variants[0].price));
  if (text.length > 0) return text.length > 155 ? `${text.slice(0, 152).trimEnd()}...` : text;
  return `${titleCase(p.title)}, ${typeLabel(p.productType).toLowerCase()} from Arya Vaidya Vilasini Vaidya Sala. ${lowest}.`;
};

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return buildMetadata({
    title: titleCase(product.title),
    description: summary(product),
    path: `/products/${handle}`,
    image: product.featuredImage?.url,
  });
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product || product.variants.length === 0) notFound();

  const related = (await getRecommendations(handle)).slice(0, 4);
  const title = titleCase(product.title);
  const collection = COLLECTION_ORDER.find((c) => product.collections.includes(c));
  const path = `/products/${handle}`;
  const crumbs = [
    { name: "Store", href: "/store" },
    ...(collection ? [{ name: collectionLabel(collection), href: `/store/${collection}` }] : []),
    { name: title, href: path },
  ];
  const optionName = product.options.find((o) => o.name !== "Title")?.name ?? "Option";
  const sku = product.variants[0].sku;

  const offers = product.variants.map((v) => ({
    "@type": "Offer",
    url: abs(path),
    price: v.price.amount,
    priceCurrency: v.price.currencyCode,
    availability: v.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    ...(v.sku ? { sku: v.sku } : {}),
  }));

  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={crumbs} />

      <div className={`grid-12 ${styles.layout}`}>
        <div className={styles.media}>
          <ProductGallery handle={handle} title={title} productType={product.productType} images={product.images} />
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>{title}</h1>
          <BuyPanel
            mode={shopMode()}
            handle={handle}
            title={title}
            variants={product.variants}
            optionName={optionName}
            image={product.featuredImage}
          />

          {product.descriptionHtml ? (
            <section aria-labelledby="about" className={styles.about}>
              <h2 id="about" className={styles.sub}>About this medicine</h2>
              <div className={styles.prose} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </section>
          ) : null}

          <dl className={styles.facts}>
            <div>
              <dt>Form</dt>
              <dd>
                <Link href={`/store?type=${encodeURIComponent(product.productType.toUpperCase())}`} className="link">
                  {typeLabel(product.productType)}
                </Link>
              </dd>
            </div>
            {collection ? (
              <div>
                <dt>Collection</dt>
                <dd>
                  <Link href={`/store/${collection}`} className="link">
                    {collectionLabel(collection)}
                  </Link>
                </dd>
              </div>
            ) : null}
            {sku ? (
              <div>
                <dt>Item code</dt>
                <dd className="num">{sku}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related" className={styles.related}>
          <h2 id="related" className={styles.relatedTitle}>Related medicines</h2>
          <ul className={styles.relatedGrid}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        </section>
      ) : null}

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${abs(path)}#product`,
            name: title,
            url: abs(path),
            description: summary(product),
            category: typeLabel(product.productType),
            brand: { "@type": "Brand", name: "AVVVS" },
            ...(sku ? { sku } : {}),
            ...(product.images.length ? { image: product.images.map((i) => i.url) } : {}),
            offers: offers.length === 1 ? offers[0] : offers,
          },
          breadcrumbSchema(crumbs.map((c) => ({ name: c.name, path: c.href }))),
        ]}
      />
    </div>
  );
}
