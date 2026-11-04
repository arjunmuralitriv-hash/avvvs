import Link from "next/link";
import styles from "./AdviceBand.module.css";
import { clinic, waHref } from "@/lib/site";

export function AdviceBand({ medicine }: { medicine?: string }) {
  const waMessage = medicine
    ? `Hello, I have a question about ${medicine}`
    : "Hello, I would like to consult a vaidyan regarding medicines.";
  const waUrl = `${waHref(clinic.phones[0])}?text=${encodeURIComponent(waMessage)}`;

  return (
    <section className={styles.band} aria-labelledby="advice-head">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="advice-head" className={styles.title}>
            Consult a Vaidyan First
          </h2>
          <p className={styles.lead}>
            Personalized guidance and classical diagnosis at our dispensary on Annie Hall Road, opposite Kozhikode railway station. Consultations daily: 9:00 AM &ndash; 1:00 PM and 2:00 PM &ndash; 5:00 PM.
          </p>
        </div>
        <div className={styles.actions}>
          <Link
            href={medicine ? `/consultation?medicine=${encodeURIComponent(medicine)}` : "/consultation"}
            className={styles.primaryBtn}
          >
            Book Consultation
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryBtn}
          >
            Consult on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
