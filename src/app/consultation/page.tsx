import { BookingForm } from "@/components/booking/BookingForm";
import { clinic, telHref, waHref } from "@/lib/site";
import { JsonLd, breadcrumbSchema, buildMetadata, clinicSchema } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Book a consultation",
  description:
    "Request a consultation at AVVVS Ayur Specialty Clinics, opposite Kozhikode railway station. Choose a date and a time slot and the clinic will call to confirm.",
  path: "/consultation",
});

export default function ConsultationPage() {
  return (
    <>
      <section className={`container ${styles.head}`}>
        <h1>Book a consultation</h1>
        <p className="lead">Choose a date and a time slot. The clinic will call to confirm.</p>
      </section>

      <section className={`container grid-12 ${styles.body}`} aria-label="Consultation request and clinic details">
        <div className={styles.form}>
          <BookingForm />
        </div>

        <aside className={styles.facts} aria-labelledby="clinic-facts">
          <h2 id="clinic-facts" className={styles.factsTitle}>At the clinic</h2>
          <dl className={styles.dl}>
            <div>
              <dt>Consultation times</dt>
              <dd>
                {clinic.timeSlots.map((t) => (
                  <span key={t.id} className="num">{t.label}</span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                <span>{clinic.name}</span>
                <span>{clinic.street}</span>
                <span>{clinic.locality}, {clinic.city}</span>
                <span>{clinic.region} {clinic.postalCode}</span>
              </dd>
            </div>
            <div>
              <dt>Landmark</dt>
              <dd>{clinic.landmark}</dd>
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
          </dl>
        </aside>
      </section>

      <JsonLd
        data={[
          clinicSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Book a consultation", path: "/consultation" },
          ]),
        ]}
      />
    </>
  );
}
