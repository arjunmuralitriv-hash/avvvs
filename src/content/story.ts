// The homepage story: from the garden to the bottle.
// Every line paraphrases or quotes avvvs.com (Home, About, Treatments, Clinic pages, Wayback 2026).
// `scene` is the key the 3D StoryCanvas uses for each chapter's set.

export type StoryChapter = {
  n: number;
  scene: "sprig" | "garden" | "picking" | "preparing" | "oil" | "factory" | "almirah" | "clinic";
  title: string;
  body: string;
  /** Botanical or factual pairs shown as a definition list. */
  facts?: { term: string; detail: string; latin?: boolean }[];
  /** Dark chapter uses the Vellum oxblood reversed colourway. */
  tone?: "dark";
  source: string;
};

export const storyHero = {
  title: "Herbs picked in Kerala, medicine since 1921",
  lead: "How AVVVS makes its 300 formulations, from the garden to the clinic.",
};

export const chapters: StoryChapter[] = [
  {
    n: 1,
    scene: "garden",
    title: "Grown beside the factory",
    body: "AVVVS keeps herbal gardens in and around its manufacturing units, to grow raw material and to conserve biodiversity.",
    source: "avvvs.com, home: Proprietary & Classical Formulations",
  },
  {
    n: 2,
    scene: "picking",
    title: "Picked by hand",
    body: "For Elakizhi, only fresh, mature, clean leaves are taken from three plants.",
    facts: [
      { term: "Erukkila", detail: "Calotropis gigantea", latin: true },
      { term: "Ummathila", detail: "Datura metel", latin: true },
      { term: "Karinochiyila", detail: "Vitex negundo", latin: true },
    ],
    source: "avvvs.com/treatments: Elakizhi",
  },
  {
    n: 3,
    scene: "preparing",
    title: "Chopped, roasted, tied",
    body: "The leaves are chopped fine and roasted with grated coconut and select spices until brittle, then tied into a tuft-handled cloth poultice.",
    source: "avvvs.com/treatments: Elakizhi, preparation",
  },
  {
    n: 4,
    scene: "oil",
    title: "Simmered into oil",
    body: "Thailams are cooked slowly in medicated oil. Mezhu Thailam, one of the in-house formulae handed down at AVVVS, is made this way.",
    tone: "dark",
    source: "avvvs.com, home; Treatments: Abhyanga",
  },
  {
    n: 5,
    scene: "factory",
    title: "Filled at our GMP factory",
    body: "Capsulation, blister packing and ointment filling run beside the traditional units. The medicines go across India and abroad.",
    facts: [
      { term: "Exported to", detail: "Russia, Austria, Slovenia, Colombia" },
      { term: "Factory", detail: "GMP-certified, in the suburbs of Kozhikode" },
    ],
    source: "avvvs.com/about-us: Company profile and legacy",
  },
  {
    n: 6,
    scene: "almirah",
    title: "On the almirah",
    body: "Over 300 classical and proprietary formulations, among them Rujanth, Slepan, Redirons and Lakshol.",
    source: "avvvs.com, home; avvvsglobal.com collections",
  },
  {
    n: 7,
    scene: "clinic",
    title: "And at the clinic",
    body: "The same poultice is warmed for Elakizhi at the AVVVS clinic opposite Kozhikode railway station, under specialised doctors.",
    source: "avvvs.com/avvvs-speciality-clinic; Treatments",
  },
];

// Product types as they appear in the Shopify catalogue (product_type), shown as almirah shelves.
export const shelves = [
  { type: "THAILAM", label: "Thailam" },
  { type: "CHOORNAM", label: "Choornam" },
  { type: "LEHYAM", label: "Lehyam" },
  { type: "ARISHTAM", label: "Arishtam" },
  { type: "KASHAYAM", label: "Kashayam" },
  { type: "GHRITHAM", label: "Ghritham" },
] as const;
