import type { FormId } from "./types";

export const FORMS: Record<FormId, { label: string; plural: string; gloss: string }> = {
  thailam:  { label: "Thailam",  plural: "Thailams",  gloss: "Medicated oil" },
  kashayam: { label: "Kashayam", plural: "Kashayams", gloss: "Decoction" },
  arishtam: { label: "Arishtam", plural: "Arishtams", gloss: "Fermented herbal decoction" },
  asavam:   { label: "Asavam",   plural: "Asavams",   gloss: "Fermented herbal liquid" },
  choornam: { label: "Choornam", plural: "Choornams", gloss: "Herbal powder" },
  lehyam:   { label: "Lehyam",   plural: "Lehyams",   gloss: "Herbal confection" },
  ghritham: { label: "Ghritham", plural: "Ghrithams", gloss: "Medicated ghee" },
  keram:    { label: "Keram",    plural: "Kerams",    gloss: "Medicated coconut oil" },
  kuzhambu: { label: "Kuzhambu", plural: "Kuzhambus", gloss: "Medicated oil blend" },
  capsule:  { label: "Capsule",  plural: "Capsules",  gloss: "" },
  syrup:    { label: "Syrup",    plural: "Syrups",    gloss: "" },
  liniment: { label: "Liniment", plural: "Liniments", gloss: "" },
  other:    { label: "Other",    plural: "Other medicines", gloss: "" },
};

export const FORM_ORDER: FormId[] = [
  "thailam",
  "kashayam",
  "arishtam",
  "asavam",
  "choornam",
  "lehyam",
  "ghritham",
  "keram",
  "kuzhambu",
  "capsule",
  "syrup",
  "liniment",
  "other",
];

export function deriveForm(productType?: string | null, title?: string | null): FormId {
  const t = (title ?? "").toUpperCase();
  const pt = (productType ?? "").toUpperCase();

  if (/\bASAVAM\b/.test(t)) return "asavam";
  if (/\bKERAM\b/.test(t)) return "keram";
  if (/\bKUZHAMBU\b/.test(t)) return "kuzhambu";
  if (/(RASAYANAM|GULAM|LEHYAM)\b/.test(t)) return "lehyam";
  if (/(GH?RU?ITH?AM|SARPIS)\b/.test(t)) return "ghritham";
  if (/\bT(H)?A(I)?LAM\b|\bTHALAM\b/.test(t) && !t.includes("CASTOR OIL")) return "thailam";

  switch (pt) {
    case "ARISHTAM": return "arishtam";
    case "KASHAYAM": return "kashayam";
    case "CHOORNAM": return "choornam";
    case "CAPSULE": return "capsule";
    case "SYRUP": return "syrup";
    case "LINIMENT": return "liniment";
    case "THAILAM": return "thailam";
    case "GHRITHAM": return "ghritham";
    case "LEHYAM": return "lehyam";
    default:
      if (t.includes("CASTOR OIL")) return "thailam";
      return "other";
  }
}

