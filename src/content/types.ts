// Shared types for the content layer. Every record is scraped from avvvs.com (see credits.ts).

export type ContentImage = {
  /** Path under /public. */
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; level: 2 | 3; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type Herb = {
  /** Common or Malayalam name as written on the source page. */
  name: string;
  /** Botanical name as written on the source page. */
  botanical?: string;
};

export type Treatment = {
  slug: string;
  name: string;
  /** Short line shown in lists, from the source heading. */
  tagline: string;
  /** One or two sentences taken from the source, used as the lead answer. */
  summary: string;
  group: "kizhi" | "oil" | "powder" | "irrigation" | "skin-hair";
  herbs: Herb[];
  /** Plain note when the source names herbs only in passing. */
  herbsNote?: string;
  preparation: string[];
  procedure: string[];
  benefits: string[];
  /** Duration exactly as the source states it. */
  duration?: string;
  /** Slugs of clinics that name this treatment in their text. */
  clinics: string[];
  /** Slugs of treatments worth reading next. */
  related: string[];
  image?: ContentImage;
  source: string;
};

export type Clinic = {
  slug: string;
  name: string;
  /** Verbatim source paragraphs, typos fixed. Empty if the source gives only a heading. */
  paragraphs: string[];
  /** True when the source page lists the clinic with no description. */
  headingOnly: boolean;
  /** Short list-line; drawn from source wording only. */
  lead: string;
  treatments: string[];
  related: string[];
  image?: ContentImage;
  source: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  /** ISO datetime from the post's published metadata. */
  published: string;
  /** Byline as shown on the source page. */
  byline: string;
  excerpt: string;
  body: Block[];
  image: ContentImage;
  sourceUrl: string;
};

export type Testimonial = {
  quote: string;
  /** Name as printed on the source page. Null when the source prints none. */
  attribution: string | null;
};
