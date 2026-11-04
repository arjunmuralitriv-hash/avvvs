import Link from "next/link";
import { clinic, telHref } from "@/lib/site";
import styles from "./ClinicalExperience.module.css";

export function ClinicalExperience() {
  return (
    <section className={styles.section} aria-labelledby="clinic-heading">
      <div className="container">
        {/* Main Banner Grid */}
        <div className={styles.mainGrid}>
          <div className={styles.infoCol}>
            <span className={styles.eyebrow}>Specialty Clinical Care · Kozhikode</span>
            <h2 id="clinic-heading" className={styles.title}>
              Physician Consultation &amp; Keraleeya Panchakarma
            </h2>
            <p className={styles.lead}>
              Receive direct diagnostic guidance from senior Ayurvedic physicians. Rooted in classical Keraleeya
              therapies, our clinics provide customized treatment plans tailored to your Prakriti and doshic balance.
            </p>

            <div className={styles.specialties}>
              <div className={styles.specialtyItem}>
                <span className={styles.bullet}>✦</span>
                <div>
                  <strong>Keraleeya Panchakarma:</strong> Pizhichil, Shirodhara, Elakizhi, and Njavarakizhi fomentation.
                </div>
              </div>
              <div className={styles.specialtyItem}>
                <span className={styles.bullet}>✦</span>
                <div>
                  <strong>Pain &amp; Musculoskeletal:</strong> Chronic joint care, spondylosis, and neuromuscular therapies.
                </div>
              </div>
              <div className={styles.specialtyItem}>
                <span className={styles.bullet}>✦</span>
                <div>
                  <strong>Dermatology &amp; Trichology:</strong> Traditional herbal remedies for skin radiance and scalp nourishment.
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/consultation" className="btn btn--primary">
                Book a Consultation →
              </Link>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${clinic.name}, ${clinic.street}, ${clinic.city} ${clinic.postalCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                Directions in Maps ↗
              </a>
            </div>
          </div>

          <div className={styles.cardCol}>
            <div className={styles.clinicCard}>
              <span className={styles.cardTag}>The Landmark Clinic</span>
              <h3 className={styles.clinicName}>{clinic.name}</h3>
              <p className={styles.landmark}>{clinic.landmark}</p>
              
              <div className={styles.detailsGroup}>
                <span className={styles.detailLabel}>Address</span>
                <address className={styles.address}>
                  {clinic.street}, {clinic.locality}<br />
                  {clinic.city}, {clinic.region} {clinic.postalCode}
                </address>
              </div>

              <div className={styles.detailsGroup}>
                <span className={styles.detailLabel}>Consultation Hours</span>
                <div className={styles.slots}>
                  {clinic.timeSlots.map((t) => (
                    <span key={t.id} className={styles.slotPill}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.detailsGroup}>
                <span className={styles.detailLabel}>Inquiries &amp; Appointments</span>
                <div className={styles.phones}>
                  {clinic.phones.map((p) => (
                    <a key={p} href={telHref(p)} className={styles.phoneLink}>
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Centenary Trust Matrix */}
        <div className={styles.trustMatrix}>
          <div className={styles.trustItem}>
            <span className={styles.trustNumber}>100+</span>
            <strong className={styles.trustLabel}>Years of Heritage</strong>
            <span className={styles.trustSub}>Uninterrupted Vaidya lineage since 1921</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustNumber}>300+</span>
            <strong className={styles.trustLabel}>Classical Formulations</strong>
            <span className={styles.trustSub}>Prepared strictly to scriptural texts</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustNumber}>GMP</span>
            <strong className={styles.trustLabel}>Certified Manufacturing</strong>
            <span className={styles.trustSub}>International standard facility in Kozhikode</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustNumber}>100%</span>
            <strong className={styles.trustLabel}>Botanical Transparency</strong>
            <span className={styles.trustSub}>Zero synthetic fillers or parabens</span>
          </div>
        </div>
      </div>
    </section>
  );
}
