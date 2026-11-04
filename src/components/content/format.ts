// Dates come from fixed ISO strings in the content layer, so they are safe to format during prerender.
const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const formatDate = (iso: string) => fmt.format(new Date(iso));

/** Sentence-case join: "a, b and c". */
export function joinList(items: string[]) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Trim to a meta description: whole sentences up to `max` characters, else cut at a word. */
export function trimTo(s: string, max = 155) {
  if (s.length <= max) return s;
  const sentences = s.match(/[^.!?]+[.!?]+/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).length > max) break;
    out += sentence;
  }
  if (out.trim()) return out.trim();
  return s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}
