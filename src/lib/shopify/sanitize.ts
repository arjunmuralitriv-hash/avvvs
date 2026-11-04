// Allowlist HTML sanitiser for Shopify body_html. No library: a small tokenizer that
//   1. drops dangerous elements together with their content (script, style, iframe, ...),
//   2. keeps only allowlisted tags, with no attributes except a safe href on <a>,
//   3. escapes every stray "<", ">" and "&" in text,
//   4. closes whatever it opened, and discards unmatched closing tags.
// Output is safe to inject with dangerouslySetInnerHTML.

const ALLOWED = new Set(["p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "u", "a", "h2", "h3", "h4", "blockquote", "table", "thead", "tbody", "tr", "th", "td"]);
const VOID = new Set(["br"]);
const HEADING_MAP: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4" };
const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math|form|select|textarea|title|head)\b[\s\S]*?(?:<\/\1\s*>|$)/gi;
const TAG = /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const ENTITY = /^&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#x[0-9a-fA-F]{1,6});/;

function escapeText(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "&") out += ENTITY.test(s.slice(i, i + 40)) ? "&" : "&amp;";
    else if (c === "<") out += "&lt;";
    else if (c === ">") out += "&gt;";
    else out += c;
  }
  return out;
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function safeHref(attrs: string): string | null {
  const m = /(?:^|\s)href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(attrs);
  if (!m) return null;
  // Strip control characters and whitespace that browsers ignore inside a scheme ("java\tscript:").
  const raw = (m[1] ?? m[2] ?? m[3] ?? "").replace(/[\x00-\x20\x7f-\x9f]/g, "");
  if (/^(https?:|mailto:|tel:)/i.test(raw) || (raw.startsWith("/") && !raw.startsWith("//")) || raw.startsWith("#")) return raw;
  return null;
}

export function sanitizeHtml(input: string): string {
  const html = input.replace(DROP_WITH_CONTENT, "");
  const stack: string[] = [];
  let out = "";
  let last = 0;
  TAG.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG.exec(html))) {
    out += escapeText(html.slice(last, m.index));
    last = m.index + m[0].length;
    if (!m[2]) continue; // comment
    let name = m[2].toLowerCase();
    name = HEADING_MAP[name] ?? name;
    if (!ALLOWED.has(name)) continue; // unknown tag: drop the tag, keep its text
    if (m[1]) {
      const at = stack.lastIndexOf(name);
      if (at < 0) continue;
      while (stack.length > at) out += `</${stack.pop()}>`;
    } else if (VOID.has(name)) {
      out += `<${name}>`;
    } else {
      if (name === "a") {
        const href = safeHref(m[3]);
        out += href ? `<a href="${escapeAttr(href)}" rel="noopener noreferrer">` : "<a>";
      } else out += `<${name}>`;
      stack.push(name);
    }
  }
  out += escapeText(html.slice(last));
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}

/** Plain text of an HTML fragment, for search and meta descriptions. */
export function htmlToText(input: string): string {
  return input
    .replace(DROP_WITH_CONTENT, " ")
    .replace(/<\/(p|li|h[1-6]|div|tr)>|<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
