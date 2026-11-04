import type { Metadata } from "next";
import { SITE_URL, org, clinic, social } from "@/lib/site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string; // e.g. "/treatments/elakizhi"
  image?: string; // absolute or site-relative; defaults to the route's opengraph-image
  type?: "website" | "article";
  noindex?: boolean;
};

/** Per-page metadata. Every page calls this from generateMetadata / metadata. */
export function buildMetadata({ title, description, path, image, type = "website", noindex }: BuildMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: org.shortName,
      locale: "en_IN",
      type,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Renders one JSON-LD block. Escapes "<" so the payload can never close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const ids = {
  org: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  clinic: `${SITE_URL}/#clinic`,
} as const;

export const abs = (path: string) => new URL(path, SITE_URL).toString();

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ids.org,
    name: org.name,
    alternateName: org.shortName,
    url: SITE_URL,
    logo: abs("/brand/avvvs-logo.png"),
    foundingDate: String(org.foundingYear),
    founder: { "@type": "Person", name: org.founder },
    slogan: org.tagline,
    email: clinic.email,
    sameAs: [social.facebook, social.instagram, social.x, "https://avvvsglobal.com"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ids.website,
    url: SITE_URL,
    name: org.shortName,
    publisher: { "@id": ids.org },
    inLanguage: "en-IN",
  };
}

export function clinicSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "LocalBusiness"],
    "@id": ids.clinic,
    name: clinic.name,
    parentOrganization: { "@id": ids.org },
    url: abs("/avvvs-speciality-clinic"),
    image: abs("/brand/avvvs-logo.png"),
    email: clinic.email,
    telephone: clinic.phones[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.street,
      addressLocality: clinic.city,
      addressRegion: clinic.region,
      postalCode: clinic.postalCode,
      addressCountry: clinic.country,
    },
    openingHoursSpecification: clinic.timeSlots.map((s) => ({
      "@type": "OpeningHoursSpecification",
      opens: s.opens,
      closes: s.closes,
    })),
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: abs("/consultation") },
      result: { "@type": "Reservation", name: "Ayurveda consultation" },
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
