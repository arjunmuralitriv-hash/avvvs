import type { Product, ProductImage } from "@/lib/shopify/types";
import type { FormId, Medicine, MedicineCard, Pack, PackUnit } from "./types";
import { deriveForm, FORMS } from "./forms";
import { gateFor } from "./policy";
import { plates } from "@/content/plates";

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export function cleanName(title: string): string {
  const t = title.replace(/\s*\d+(\.\d+)?\s*(ml|gm?s?|g|tablets?|capsules?)\b/gi, "").trim();
  return titleCase(t).replace(/\bThalam\b/g, "Thailam");
}

export function parsePackFromTitle(title: string): Pack | null {
  const match = title.match(/(\d+(?:\.\d+)?)\s*(ml|gm?s?|g|capsules?|tablets?)\b/i);
  if (!match) return null;
  const quantity = parseFloat(match[1]);
  let unit: PackUnit = "ml";
  const rawUnit = match[2].toLowerCase();
  if (rawUnit.startsWith("g")) unit = "g";
  else if (rawUnit.startsWith("cap")) unit = "capsules";
  else if (rawUnit.startsWith("tab")) unit = "tablets";
  return { quantity, unit, source: "title" };
}

export function resolveImageRoles(images: ProductImage[]) {
  const heroImage = images[0] ?? null;
  let labelImage: ProductImage | null = null;
  for (const img of images) {
    if (img.url.toLowerCase().includes("back")) {
      labelImage = img;
      break;
    }
  }
  if (!labelImage && images.length >= 2) {
    labelImage = images[images.length - 1];
  }

  const hoverImage = images.length > 1 && images[1] !== labelImage ? images[1] : null;
  return { heroImage, hoverImage, labelImage };
}

export function matchFilmPlants(medicineName: string, compositionNames: string[]): string[] {
  const matches: string[] = [];
  const comp = compositionNames.map((c) => c.toLowerCase());
  const med = medicineName.toLowerCase();

  for (const pl of plates) {
    const bin = pl.binomial.toLowerCase();
    const sanskrit = pl.sanskrit.toLowerCase();
    if (
      comp.some((c) => c.includes(bin) || c.includes(sanskrit)) ||
      med.includes(sanskrit)
    ) {
      matches.push(pl.slug);
    }
  }
  return matches;
}

export function mergeMedicine(product: Product): Medicine {
  const name = cleanName(product.title);
  const form: FormId = deriveForm(product.productType, product.title);
  const pack = parsePackFromTitle(product.title);
  const { heroImage, hoverImage, labelImage } = resolveImageRoles(product.images);

  const primaryVariant = product.variants[0];
  const price = primaryVariant?.price ?? { amount: "0.0", currencyCode: "INR" };
  const compareAtPrice =
    primaryVariant?.compareAtPrice &&
    parseFloat(primaryVariant.compareAtPrice.amount) > parseFloat(price.amount)
      ? primaryVariant.compareAtPrice
      : null;

  const available = product.availableForSale && (primaryVariant ? primaryVariant.available : true);
  const gate = gateFor({ scheduleE1: "unknown", label: null });
  const purchasable = available && gate.kind === "none";
  const filmPlantSlugs = matchFilmPlants(name, []);

  return {
    handle: product.handle,
    productId: product.id,
    variantId: primaryVariant?.id ?? product.id,
    shopifyTitle: product.title,
    name,
    form,
    collections: (product.collections.filter(
      (c) => c === "classical" || c === "proprietary"
    ) as ("classical" | "proprietary")[]) || ["classical"],
    price,
    compareAtPrice,
    priceIsMrp: false,
    available,
    sku: primaryVariant?.sku ?? null,
    images: product.images,
    heroImage,
    hoverImage,
    labelImage,
    pack,
    label: null,
    indications: null,
    scheduleE1: "unknown",
    returnable: true,
    gate,
    purchasable,
    status: "missing",
    relatedHandles: [],
    synonyms: [],
    filmPlantSlugs,
    searchKeys: [name.toLowerCase(), form, product.productType?.toLowerCase() ?? ""],
  };
}

export function toCard(m: Medicine): MedicineCard {
  return {
    handle: m.handle,
    name: m.name,
    formLabel: FORMS[m.form]?.label ?? "Medicine",
    packLabel: m.pack ? `${m.pack.quantity} ${m.pack.unit}` : null,
    price: m.price,
    compareAtPrice: m.compareAtPrice,
    available: m.available,
    purchasable: m.purchasable,
    variantId: m.variantId,
    heroImage: m.heroImage,
    hoverImage: m.hoverImage,
  };
}
