import Link from "next/link";
import { clinic, org, social, telHref, waHref } from "@/lib/site";
import { JsonLd, breadcrumbSchema, buildMetadata, clinicSchema } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Contact AVVVS",
  description:
    "Address, phone numbers, email and consultation times for AVVVS Ayur Specialty Clinics, opposite Kozhikode railway station, Kerala.",
  path: "/contact-us",
});

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${clinic.name}, ${clinic.street}, ${clinic.locality}, ${clinic.city} ${clinic.postalCode}`,
)}`;

export default function ContactPage() {
  return (
    <>
      <section className={`container ${styles.head}`}>
        <h1>Contact AVVVS</h1>
        <p className="lead">{org.name}, {clinic.landmark.toLowerCase()}.</p>
      </section>

      <section className={`container ${styles.body}`} aria-label="Contact details">
        <dl className={styles.rows}>
          <div>
            <dt>Address</dt>
            <dd>
              <span>{clinic.name}</span>
              <span>{clinic.street}</span>
              <span>{clinic.locality}, {clinic.city}</span>
              <span>{clinic.region} {clinic.postalCode}</span>
              <span>{clinic.landmark}</span>
              <a className="link" href={mapsHref} rel="noopener">Open in Google Maps</a>
            </dd>
          </div>
          <div>
            <dt>Consultation times</dt>
            <dd>
              {clinic.timeSlots.map((t) => (
                <span key={t.id} className="num">{t.label}</span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Call</dt>
            <dd>
              {clinic.phones.map((p) => (
                <a key={p} className="link num" href={telHref(p)}>{p}</a>
              ))}
            </dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>
              {clinic.phones.map((p) => (
                <a key={p} className="link num" href={waHref(p)} rel="noopener">{p}</a>
              ))}
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd><a className="link" href={`mailto:${clinic.email}`}>{clinic.email}</a></dd>
          </div>
          <div>
            <dt>Elsewhere</dt>
            <dd>
              <a className="link" href={social.facebook} rel="noopener">Facebook</a>
              <a className="link" href={social.instagram} rel="noopener">Instagram</a>
              <a className="link" href={social.x} rel="noopener">X</a>
            </dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <Link className="btn btn--primary" href="/consultation">Book a consultation</Link>
        </div>
      </section>

      <JsonLd
        data={[
          clinicSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact-us" },
          ]),
        ]}
      />
    </>
  );
}
