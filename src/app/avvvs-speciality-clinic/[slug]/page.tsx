import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { Faq, type FaqItem } from "@/components/content/Faq";
import { trimTo } from "@/components/content/format";
import { buildMetadata, JsonLd, breadcrumbSchema, faqSchema, abs, ids } from "@/lib/seo";
import { clinic as site, telHref } from "@/lib/site";
import { clinics, getClinic, getTreatment } from "@/content";
import styles from "./page.module.css";

export function generateStaticParams() {
  return clinics.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/avvvs-speciality-clinic/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getClinic(slug);
  if (!c) return {};
  const description = c.paragraphs[0]
    ? trimTo(c.paragraphs[0])
    : `${c.name} at ${site.name}, ${site.city}. Listed on the AVVVS clinic page; call or book a consultation for details.`;
  return buildMetadata({
    title: c.name,
    description,
    path: `/avvvs-speciality-clinic/${c.slug}`,
    image: c.image?.src,
  });
}

// Extra questions, each answered word for word from the clinic page. Questions the text cannot answer are left out.
const extraFaq: Record<string, FaqItem[]> = {
  headache: [
    {
      q: "What are the common types of headache?",
      a: "Cluster headaches, tension headaches, sinusitis, and migraine are common types of headaches.",
    },
    {
      q: "Are headaches dangerous?",
      a: "Most headaches are not dangerous and pass off. Persisting headaches may be a sign of a serious underlying condition and have to be medically evaluated and managed.",
    },
  ],
  "pregnancy-and-post-natal-care": [
    {
      q: "What does the care include?",
      a: "Pregnancy month-wise care and post-natal care include diet, medicines, therapies, education, and mental support for the mother and family.",
    },
  ],
  "lifestyle-diseases": [
    {
      q: "What are lifestyle diseases?",
      a: "Lifestyle diseases are defined as the health problems that arise from unhealthy changes in lifestyle, habitat, and food.",
    },
  ],
  "obesity-management": [
    {
      q: "What techniques does the clinic combine?",
      a: "It combines the Ayurveda way of body contouring, like Udhwarthana or Uthsadana procedures, with cryolipolysis, RF body contouring and lipolaser techniques. Diet modifications and exercises also form part of the treatment course.",
    },
  ],
};

export default async function ClinicPage({ params }: PageProps<"/avvvs-speciality-clinic/[slug]">) {
  const { slug } = await params;
  const c = getClinic(slug);
  if (!c) notFound();

  const path = `/avvvs-speciality-clinic/${c.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Clinics", path: "/avvvs-speciality-clinic" },
    { name: c.name, path },
  ];
  const treatments = c.treatments.map(getTreatment).filter((t) => !!t);
  const others = c.related.map((s) => getClinic(s)).filter((x) => !!x);

  const faqs: FaqItem[] = [];
  if (c.paragraphs[0]) faqs.push({ q: `What does the ${c.name} do?`, a: c.paragraphs[0] });
  faqs.push(...(extraFaq[c.slug] ?? []));
  faqs.push({
    q: "Where is the AVVVS clinic in Kozhikode?",
    a: `${site.name} is at ${site.street}, ${site.locality}, ${site.city}, ${site.region} ${site.postalCode}. ${site.landmark}.`,
  });

  return (
    <>
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <header className={`container ${styles.head}`}>
        <div className={styles.headText}>
          <h1>
            <ViewTransition name={`clinic-${c.slug}`} share="morph" default="none">
              <span>{c.name}</span>
            </ViewTransition>
          </h1>
          <p className="lead">{c.lead}</p>
          <div className={styles.actions}>
            <Link className="btn btn--primary" href="/consultation">
              Book a consultation
            </Link>
            <a className="btn" href={telHref(site.phones[0])}>
              Call {site.phones[0]}
            </a>
          </div>
        </div>
        {c.image ? (
          <Image
            className={styles.pictogram}
            src={c.image.src}
            alt={c.image.alt}
            width={c.image.width}
            height={c.image.height}
            sizes="(max-width: 60rem) 60vw, 28vw"
            priority
          />
        ) : null}
      </header>

      <section className={`container ${styles.answer}`} aria-labelledby="what-title">
        <h2 id="what-title">What does this clinic do?</h2>
        <div className={styles.answerText}>
          {c.headingOnly ? (
            <p>
              The AVVVS clinic page lists this clinic among its specialty clinics and gives no further description. For
              details, call {site.phones[0]} or {site.phones[1]}, or book a consultation.
            </p>
          ) : (
            c.paragraphs.map((t) => <p key={t.slice(0, 32)}>{t}</p>)
          )}
        </div>
      </section>

      {treatments.length ? (
        <section className={`container ${styles.related}`} aria-labelledby="rel-title">
          <h2 id="rel-title">Related treatments</h2>
          <ul>
            {treatments.map((t) => (
              <li key={t.slug}>
                <Link className="link" href={`/treatments/${t.slug}`}>
                  {t.name}
                </Link>
                <span>{t.tagline}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {c.headingOnly ? null : (
        <section className={`container ${styles.faqWrap}`}>
          <Faq id="faq-title" title="Questions and answers" items={faqs} />
        </section>
      )}

      <section className="band band--paper" aria-labelledby="others-title">
        <div className={`container ${styles.others}`}>
          <h2 id="others-title">Other clinics</h2>
          <ul>
            {others.map((o) => (
              <li key={o.slug}>
                <Link className="chip" href={`/avvvs-speciality-clinic/${o.slug}`}>
                  {o.name}
                </Link>
              </li>
            ))}
            <li>
              <Link className="chip" href="/avvvs-speciality-clinic">
                All clinics
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "MedicalClinic",
            "@id": `${abs(path)}#clinic`,
            name: c.name,
            url: abs(path),
            description: c.paragraphs[0] ?? `${c.name} at ${site.name}.`,
            parentOrganization: { "@id": ids.org },
            isPartOf: { "@id": ids.clinic },
            telephone: site.phones[0],
            address: {
              "@type": "PostalAddress",
              streetAddress: site.street,
              addressLocality: site.city,
              addressRegion: site.region,
              postalCode: site.postalCode,
              addressCountry: site.country,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${abs(path)}#webpage`,
            url: abs(path),
            name: c.name,
            about: { "@id": `${abs(path)}#clinic` },
            isPartOf: { "@id": ids.website },
            inLanguage: "en-IN",
          },
          ...(c.headingOnly ? [] : [faqSchema(faqs)]),
        ]}
      />
    </>
  );
}
