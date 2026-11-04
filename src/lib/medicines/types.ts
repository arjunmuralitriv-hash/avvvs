import type { Money, ProductImage } from "@/lib/shopify/types";

export type FormId =
  | "asavam"
  | "arishtam"
  | "kashayam"
  | "keram"
  | "kuzhambu"
  | "thailam"
  | "choornam"
  | "ghritham"
  | "lehyam"
  | "capsule"
  | "syrup"
  | "liniment"
  | "other";

export type CollectionId = "classical" | "proprietary";
export type RouteOfUse = "internal" | "external";
export type TriState = "yes" | "no" | "unknown";
export type SheetStatus = "draft" | "approved";
export type PackUnit = "ml" | "g" | "capsules" | "tablets";

export type Pack = {
  quantity: number;
  unit: PackUnit;
  /** "sheet" = transcribed from label and approved; "title" = parsed from Shopify title */
  source: "sheet" | "title";
};

export type CompositionRow = {
  /** Botanical or substance name exactly as printed */
  name: string;
  isBinomial: boolean;
  /** e.g. "rhizome"; null when not printed */
  part: string | null;
  /** e.g. "1.143 g"; null when not printed */
  amount: string | null;
};

/** Verbatim facts from physical label */
export type LabelFacts = {
  nameMl: string | null;
  nameHi: string | null;
  route: RouteOfUse | null;
  classicalReference: string | null;
  compositionBasis: string | null;
  composition: CompositionRow[];
  compositionSource: "label" | "avvvs-blog" | null;
  dosage: string;
  directions: string | null;
  cautions: string | null;
  shelfLifeMonths: number | null;
  storage: string | null;
  manufacturer: { name: string; address: string | null; licenceNo: string | null } | null;
  prescriptionRequired: boolean;
  approvedBy: string;
  approvedOn: string;
};

export type Gate =
  | { kind: "none" }
  | { kind: "consult"; reason: "schedule-e1" | "schedule-e1-unknown" | "prescription" };

export type Medicine = {
  handle: string;
  productId: string;
  variantId: string;
  shopifyTitle: string;
  name: string;
  form: FormId;
  collections: CollectionId[];
  price: Money;
  compareAtPrice: Money | null;
  priceIsMrp: boolean;
  available: boolean;
  sku: string | null;
  images: ProductImage[];
  heroImage: ProductImage | null;
  hoverImage: ProductImage | null;
  labelImage: ProductImage | null;
  pack: Pack | null;
  label: LabelFacts | null;
  indications: string | null;
  scheduleE1: TriState;
  returnable: boolean;
  gate: Gate;
  purchasable: boolean;
  status: SheetStatus | "missing";
  relatedHandles: string[];
  synonyms: string[];
  filmPlantSlugs: string[];
  searchKeys: string[];
};

export type MedicineCard = {
  handle: string;
  name: string;
  formLabel: string;
  packLabel: string | null;
  price: Money;
  compareAtPrice: Money | null;
  available: boolean;
  purchasable: boolean;
  variantId: string;
  heroImage: ProductImage | null;
  hoverImage: ProductImage | null;
};

export type FormSummary = {
  id: FormId;
  label: string;
  plural: string;
  gloss: string;
  count: number;
  inStock: number;
  thumb: ProductImage | null;
  href: string;
};

export type StoreSort = "relevance" | "name-asc" | "price-asc" | "price-desc";

export type StoreQuery = {
  q: string;
  form: FormId | "";
  collection: CollectionId | "";
  route: RouteOfUse | "";
  ref: string;
  stock: boolean;
  sort: StoreSort;
  page: number;
};

