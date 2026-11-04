// Image and text credits for the content layer.

export type Credit = { scope: string; source: string; note: string };

/** Wikimedia Commons images used by the content pages. None are used here, so this is empty. */
export const wikimediaCredits: { file: string; author: string; license: string; url: string }[] = [];

export const credits: Credit[] = [
  {
    scope: "Text",
    source: "avvvs.com, read from the Internet Archive snapshots of May to July 2026 and checked against the live pages",
    note: "Wording kept, typos fixed, all-capital paragraphs set in sentence case.",
  },
  {
    scope: "Gallery, factory, products, outreach, 100th year, Navathi and news photographs",
    source: "avvvs.com/gallery",
    note: "Photographs published by AVVVS on its own site. Newspaper clippings belong to their original publishers.",
  },
  {
    scope: "Blog featured images, clinic pictograms and therapy photographs",
    source: "avvvs.com",
    note: "Used on the old site as illustrations. Several look like licensed stock photographs; the licence is not stated on the source pages.",
  },
  {
    scope: "Portraits of Kaloor Neelakandan Vaidyar and K.N. Ramadas Vaidyar",
    source: "avvvs.com/about-us",
    note: "Archive portraits as published on the About page.",
  },
];
