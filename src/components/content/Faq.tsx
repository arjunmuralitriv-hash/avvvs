import styles from "./content.module.css";

export type FaqItem = { q: string; a: string };

/** Visible FAQ block. Every answer is shown as text; pair with faqSchema() on the page. */
export function Faq({ id, title, items }: { id: string; title: string; items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className={styles.faq} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <dl>
        {items.map((f) => (
          <div key={f.q}>
            <dt>{f.q}</dt>
            <dd>{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
