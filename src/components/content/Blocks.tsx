import type { Block } from "@/content/types";
import styles from "./content.module.css";

/** Renders structured content blocks as real paragraphs, headings and lists. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className={styles.prose}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "h":
            return b.level === 2 ? <h2 key={i}>{b.text}</h2> : <h3 key={i}>{b.text}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ol>
            );
        }
      })}
    </div>
  );
}
