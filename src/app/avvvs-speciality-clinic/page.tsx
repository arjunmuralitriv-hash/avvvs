import { ViewTransition } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { buildMetadata, JsonLd, breadcrumbSchema, abs, ids } from "@/lib/seo";
import { clinic as site } from "@/lib/site";
import { clinics, clinicsIntro, clinicChain } from "@/content";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "AVVVS Ayur Speciality Clinic, Kozhikode",
  description:
    "Eight specialty clinics at AVVVS Ayur Specialty Clinics, Kozhikode, among them women health, skin and hair care, headache, pain management and obesity management, plus Keraleeya Panchakarma therapies.",
  path: "/avvvs-speciality-clinic",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Clinics", path: "/avvvs-speciality-clinic" },
];

export default function ClinicsPage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <header className={`container ${styles.head}`}>
        <h1>AVVVS Ayur Speciality Clinic</h1>
        <p className="lead">{clinicsIntro[0]}</p>
      </header>

      {/* Index of clinics */}
      <section className="container" aria-labelledby="index-title">
        <h2 id="index-title" className={styles.indexTitle}>
          The eight clinics
        </h2>
        <ol className={styles.index}>
          {clinics.map((c, i) => (
            <li key={c.slug}>
              <span className={`${styles.n} num`} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>
                <ViewTransition name={`clinic-${c.slug}`} share="morph" default="none">
                  <Link className="link" href={`/avvvs-speciality-clinic/${c.slug}`}>
                    {c.name}
                  </Link>
                </ViewTransition>
              </h3>
              <p>{c.lead}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What the clinics offer */}
      <section className="section" aria-labelledby="offer-title">
        <div className="container grid-12">
          <h2 id="offer-title" className={styles.offerHead}>
            What the clinics offer
          </h2>
          <div className={styles.offerText}>
            {clinicsIntro.slice(1).map((t) => (
              <p key={t.slice(0, 28)}>{t}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--paper" aria-labelledby="chain-title">
        <div className="container grid-12">
          <h2 id="chain-title" className={styles.offerHead}>
            Herbal Ayurveda therapies
          </h2>
          <div className={styles.offerText}>
            {clinicChain.map((t) => (
              <p key={t.slice(0, 28)}>{t}</p>
            ))}
            <p>
              <Link className="link" href="/treatments">
                Read about the treatments
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className={`container ${styles.visit}`} aria-labelledby="visit-title">
        <h2 id="visit-title">Where to find us</h2>
        <p className="lead">
          {site.name}, {site.street}, {site.locality}, {site.city}, {site.region} {site.postalCode}. {site.landmark}.
        </p>
        <Link className="btn btn--primary" href="/consultation">
          Book a consultation
        </Link>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${abs("/avvvs-speciality-clinic")}#webpage`,
            url: abs("/avvvs-speciality-clinic"),
            name: "AVVVS Ayur Speciality Clinic",
            isPartOf: { "@id": ids.website },
            about: { "@id": ids.clinic },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: clinics.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: c.name,
                url: abs(`/avvvs-speciality-clinic/${c.slug}`),
              })),
            },
          },
        ]}
      />
    </>
  );
}
