import "server-only";
import { getProduct, getProducts } from "@/lib/shopify";
import type { ProductImage } from "@/lib/shopify/types";
import type { FormSummary, Medicine, MedicineCard } from "./types";
import { FORM_ORDER, FORMS } from "./forms";
import { mergeMedicine, toCard } from "./merge";

export const SIGNATURE_HANDLES = [
  "mezhuthailam",
  "rujanth-linment",
  "rujanth-capsule",
  "lakshol",
  "slepan-capsule",
  "red-irons-capsule",
];

export async function getMedicines(): Promise<Medicine[]> {
  const products = await getProducts();
  return products.map(mergeMedicine).sort((a, b) => a.name.localeCompare(b.name, "en-IN"));
}

export async function getMedicine(handle: string): Promise<Medicine | null> {
  const p = await getProduct(handle);
  if (!p) return null;
  return mergeMedicine(p);
}

export async function getFormSummaries(): Promise<FormSummary[]> {
  const meds = await getMedicines();
  const map = new Map<string, { count: number; inStock: number; thumb: ProductImage | null }>();

  for (const m of meds) {
    const cur = map.get(m.form) ?? { count: 0, inStock: 0, thumb: null };
    cur.count++;
    if (m.available) {
      cur.inStock++;
      if (!cur.thumb && m.heroImage) cur.thumb = m.heroImage;
    }
    map.set(m.form, cur);
  }

  const summaries: FormSummary[] = [];
  for (const id of FORM_ORDER) {
    const data = map.get(id);
    if (!data || data.count === 0) continue;
    const def = FORMS[id];
    summaries.push({
      id,
      label: def.label,
      plural: def.plural,
      gloss: def.gloss,
      count: data.count,
      inStock: data.inStock,
      thumb: data.thumb,
      href: `/store/${id}`,
    });
  }
  return summaries;
}

export async function getSignatureCards(): Promise<MedicineCard[]> {
  const meds = await getMedicines();
  const medMap = new Map(meds.map((m) => [m.handle, m]));
  const cards: MedicineCard[] = [];
  for (const h of SIGNATURE_HANDLES) {
    const m = medMap.get(h);
    if (m) cards.push(toCard(m));
  }
  return cards;
}

export { toCard };
