// S02 botanical plates, ring order (docs/plan/01-creative-direction.md §5.2).
// Only names AVVVS prints or the engraving itself carries. Malayalam script waits for a native reader.
// Tab numbers marked null are not yet read off the plate, so they are not shown.

export type Plate = {
  slug: string;
  common: string;
  sanskrit: string;
  malayalam: string; // romanised
  binomial: string;
  reference: string; // the real book reference
  products: { handle: string; name: string }[];
};

export const plates: Plate[] = [
  {
    slug: "vitex-negundo",
    common: "Five-leaved chaste tree",
    sanskrit: "Nirgundi",
    malayalam: "Karinochi",
    binomial: "Vitex negundo",
    reference: "Hort. Mal. II",
    products: [{ handle: "rujanth-linment", name: "Rujanth Liniment" }],
  },
  {
    slug: "ricinus-communis",
    common: "Castor",
    sanskrit: "Eranda",
    malayalam: "Avanakku",
    binomial: "Ricinus communis",
    reference: "Hort. Mal. II",
    products: [
      { handle: "rujanth-capsule", name: "Rujanth Capsule" },
      { handle: "gandharvahasthadi-castor-oil", name: "Gandharvahastadi Castor Oil" },
    ],
  },
  {
    slug: "sesamum-indicum",
    common: "Sesame",
    sanskrit: "Tila",
    malayalam: "Schit-Elu",
    binomial: "Sesamum indicum",
    reference: "Hort. Mal. IX, tab. 54",
    products: [
      { handle: "mezhuthailam", name: "Mezhu Thailam" },
      { handle: "rujanth-linment", name: "Rujanth Liniment" },
    ],
  },
  {
    slug: "curcuma-longa",
    common: "Turmeric",
    sanskrit: "Haridra",
    malayalam: "Manjella kua",
    binomial: "Curcuma longa",
    reference: "Hort. Mal. XI, tab. 11",
    products: [{ handle: "lakshol", name: "Lakshol" }],
  },
  {
    slug: "zingiber-officinale",
    common: "Ginger",
    sanskrit: "Shunti",
    malayalam: "Inschi kua",
    binomial: "Zingiber officinale",
    reference: "Hort. Mal. XI, tab. 12",
    products: [{ handle: "rujanth-capsule", name: "Rujanth Capsule" }],
  },
];
