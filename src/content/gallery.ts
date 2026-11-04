import type { ContentImage } from "./types";

// Source: avvvs.com/gallery (six category pages). Alt text written from what each photo shows.
// Captions and dates are not given on the source page, so none are recorded.

export type GalleryCategory = {
  slug: string;
  title: string;
  images: ContentImage[];
};

export const galleryCategories: GalleryCategory[] = [
  {
    slug: "navathi-celebration",
    title: "Navathi Celebration",
    images: [
      { src: "/content/gallery/navathi1.webp", width: 1300, height: 488, alt: "Collage of speakers at microphones at the Navathi celebration" },
      { src: "/content/gallery/navathi2.webp", width: 1300, height: 488, alt: "Collage including a speaker on stage and a banner reading Navathi Celebrations 2011" },
      { src: "/content/gallery/navathi3.webp", width: 1300, height: 488, alt: "Collage of the dais and the audience at the Navathi celebration" },
      { src: "/content/gallery/navathi4.webp", width: 1300, height: 488, alt: "Collage of guests presenting gifts to children and elders" },
      { src: "/content/gallery/navathi5.webp", width: 1300, height: 488, alt: "Collage of speakers at lecterns and a packed hall at night" },
      { src: "/content/gallery/navathi6.webp", width: 1300, height: 488, alt: "Collage of guests lighting lamps on stage in a hall with golden plants" },
      { src: "/content/gallery/navathi7.webp", width: 1300, height: 488, alt: "Collage of guests receiving mementos and garlands on stage" },
      { src: "/content/gallery/navathi8.webp", width: 1300, height: 488, alt: "Collage of guests lighting lamps and receiving gifts" },
    ],
  },
  {
    slug: "products",
    title: "Products",
    images: [
      { src: "/content/gallery/red-irons.webp", width: 1300, height: 1950, alt: "Bottle and carton of AVVVS Red Irons syrup on a black ground" },
      { src: "/content/gallery/hair-greens-oil.webp", width: 802, height: 1199, alt: "Hair Greens oil bottle with coconut halves, amla and herb sprigs on a yellow ground" },
      { src: "/content/gallery/diastat-capsules.webp", width: 1300, height: 1102, alt: "White bottle of AVVVS Diastat capsules on a white ground" },
      { src: "/content/gallery/rujanth-1.webp", width: 1300, height: 1950, alt: "Bottle and carton of AVVVS Rujanth liniment on stones against a pink wall" },
      { src: "/content/gallery/rujanth-2.webp", width: 1300, height: 1950, alt: "Bottle and carton of AVVVS Rujanth liniment on red satin" },
      { src: "/content/gallery/hair-greens-2.webp", width: 1300, height: 867, alt: "Bottle of AVVVS Hair Greens hair oil beside amla fruit and a split coconut on a yellow ground" },
      { src: "/content/gallery/hair-greens-3.webp", width: 1300, height: 1950, alt: "Hair Greens oil bottle and its carton beside coconut halves and amla on a yellow ground" },
    ],
  },
  {
    slug: "factory",
    title: "Factory",
    images: [
      { src: "/content/gallery/factory-1.webp", width: 1300, height: 978, alt: "Row of large steel cauldrons in a tiled preparation hall" },
      { src: "/content/gallery/factory-2.webp", width: 1300, height: 1662, alt: "Two workers beside a wide vessel of dark medicated oil" },
      { src: "/content/gallery/factory-3.webp", width: 1300, height: 867, alt: "Stainless steel mixing tanks with a staircase in a clean production room" },
      { src: "/content/gallery/factory-4.webp", width: 1300, height: 867, alt: "Two workers at the stainless steel mixing tanks" },
      { src: "/content/gallery/factory5.webp", width: 1300, height: 1425, alt: "Large steam boiler in an open-sided shed" },
      { src: "/content/gallery/factory6.webp", width: 1300, height: 1191, alt: "Side view of a steam boiler and its flue" },
      { src: "/content/gallery/factory7.webp", width: 1300, height: 867, alt: "Warehouse with stacked cardboard cartons and white sacks beside red floor lines" },
      { src: "/content/gallery/factory8.webp", width: 1300, height: 1023, alt: "Cardboard boxes and a blue trolley in a storage area" },
      { src: "/content/gallery/factory9.webp", width: 1300, height: 867, alt: "Long white air-handling unit under a metal roof" },
      { src: "/content/gallery/factory10.webp", width: 1300, height: 1024, alt: "Worker in a blue gown and cap at an ointment filling machine" },
      { src: "/content/gallery/factory11.webp", width: 1300, height: 1950, alt: "Close-up of a capsule counting machine with blue capsules on a turntable" },
      { src: "/content/gallery/factory12.webp", width: 1300, height: 1950, alt: "Blister packing machine with a green crate of blister strips" },
      { src: "/content/gallery/factory13.webp", width: 1300, height: 867, alt: "Blister packing machine with strips of red and white packs" },
      { src: "/content/gallery/factory14.webp", width: 1300, height: 1950, alt: "Strip of blister packs coming off the packing machine" },
      { src: "/content/gallery/factory15.webp", width: 1300, height: 1010, alt: "Worker operating a blister packing machine" },
      { src: "/content/gallery/factory16.webp", width: 1300, height: 1108, alt: "Capsule filling machine in a glass-walled room" },
      { src: "/content/gallery/factory17.webp", width: 1300, height: 867, alt: "Cartons stacked on a tiled floor in a store room" },
      { src: "/content/gallery/factory18.webp", width: 1300, height: 867, alt: "Stacks of cartons in a store room" },
      { src: "/content/gallery/fatory19.webp", width: 1300, height: 867, alt: "Mezzanine storage with metal shelves and cartons" },
      { src: "/content/gallery/factory20.webp", width: 1300, height: 867, alt: "Capsule sealing machine carrying white bottles along a conveyor" },
    ],
  },
  {
    slug: "news-and-presence",
    title: "News & Presence",
    images: [
      { src: "/content/gallery/news-1.webp", width: 486, height: 564, alt: "Malayalam newspaper clipping with a photograph of people on a stage" },
      { src: "/content/gallery/news-2.webp", width: 841, height: 274, alt: "Narrow Malayalam newspaper clipping with a photograph of guests lighting a lamp" },
      { src: "/content/gallery/news-3.webp", width: 828, height: 418, alt: "Malayalam newspaper clipping with a photograph of guests on a stage under an Arya Vaidya Vilasini Vaidya Sala banner" },
      { src: "/content/gallery/news-4.webp", width: 483, height: 332, alt: "Malayalam newspaper clipping with a large headline and three columns of text" },
      { src: "/content/gallery/news-5.webp", width: 612, height: 319, alt: "Malayalam newspaper clipping about the Navathi celebration, with a photograph of a lamp being lit" },
      { src: "/content/gallery/news-6.webp", width: 1511, height: 1010, alt: "English newspaper clipping headed Physicians warn against overdependence on medicines" },
      { src: "/content/gallery/news-7.webp", width: 1009, height: 1515, alt: "English newspaper clipping headed Public health sector revamp promised, with a portrait of a man" },
      { src: "/content/gallery/news-8.webp", width: 1600, height: 655, alt: "Malayalam newspaper clipping with a photograph of guests and a headline in red type" },
      { src: "/content/gallery/news-9.webp", width: 410, height: 538, alt: "Small Malayalam newspaper clipping with a photograph of guests on stage" },
      { src: "/content/gallery/news-10.webp", width: 733, height: 970, alt: "Malayalam newspaper clipping with a photograph of guests lighting a lamp and a pink headline" },
      { src: "/content/gallery/news-11.webp", width: 258, height: 190, alt: "Newspaper photograph of an elderly man in white seated on a stage, with a Malayalam caption" },
      { src: "/content/gallery/news-12.webp", width: 522, height: 761, alt: "Newspaper advertisement for Navathi 2011 with portraits of ten people" },
      { src: "/content/gallery/news-13.webp", width: 499, height: 532, alt: "Malayalam newspaper clipping with a photograph of guests lighting a lamp" },
      { src: "/content/gallery/news-14.webp", width: 584, height: 312, alt: "Malayalam newspaper clipping with a photograph of guests and a headline in quotation marks" },
      { src: "/content/gallery/news-15.webp", width: 506, height: 303, alt: "Malayalam newspaper clipping dated 26 September 2011 with a large headline" },
      { src: "/content/gallery/news-17.webp", width: 400, height: 635, alt: "English newspaper clipping headed Health Sector Reduced to Money-enticing Industry, with a photograph of a man speaking" },
      { src: "/content/gallery/news-18.webp", width: 303, height: 606, alt: "Narrow Malayalam newspaper clipping with a photograph of guests on stage" },
      { src: "/content/gallery/news-19.webp", width: 744, height: 390, alt: "Malayalam newspaper clipping with a photograph of guests lighting a lamp and a large headline" },
      { src: "/content/gallery/news-20.webp", width: 593, height: 323, alt: "Malayalam newspaper clipping with a photograph of the front of a shop building" },
    ],
  },
  {
    slug: "avvvs-outreach",
    title: "AVVVS Outreach",
    images: [
      { src: "/content/gallery/avvvs-outreach-1.webp", width: 1300, height: 867, alt: "Staff at an exhibition stall with medicine bottles and boxes on a white table" },
      { src: "/content/gallery/avvvs-outreach-2.webp", width: 1300, height: 867, alt: "Two men leaning over a table of red medicine boxes at an AVVVS stall" },
      { src: "/content/gallery/avvvs-outreach-3.webp", width: 1300, height: 867, alt: "A man arranging red boxes and green jars at a stall under a Malayalam and English AVVVS banner" },
      { src: "/content/gallery/avvvs-outreach-4.webp", width: 1300, height: 867, alt: "Visitors and staff at an AVVVS stall with rows of medicine bottles" },
    ],
  },
  {
    slug: "100th-year-celebration",
    title: "100th Year Celebration",
    images: [
      { src: "/content/gallery/100th-year-celebration-1.webp", width: 1280, height: 853, alt: "Guests on a stage around a tall brass lamp being lit" },
      { src: "/content/gallery/100th-year-celebration-2.webp", width: 1280, height: 853, alt: "Two men talking in a hall, one holding a paper, with other guests behind them" },
      { src: "/content/gallery/100th-year-celebration-3.webp", width: 1280, height: 853, alt: "Four men standing close together for a photograph" },
      { src: "/content/gallery/100th-year-celebration-4.webp", width: 1280, height: 853, alt: "Three men wearing name badges seated in a crowded hall" },
      { src: "/content/gallery/100th-year-celebration-5.webp", width: 1280, height: 853, alt: "A woman at a lectern with her hands pressed together in greeting" },
      { src: "/content/gallery/100th-year-celebration-6.webp", width: 1280, height: 853, alt: "Audience in a hall, including men in white dhotis and one in an orange kurta" },
      { src: "/content/gallery/100th-year-celebration-7.webp", width: 1280, height: 853, alt: "Men and a woman seated in the audience, one man holding papers" },
      { src: "/content/gallery/100th-year-celebration-8.webp", width: 1280, height: 853, alt: "A guest receiving a framed memento on stage in front of a 100 year backdrop" },
      { src: "/content/gallery/100th-year-celebration-9.webp", width: 1280, height: 853, alt: "A man speaking at a podium while guests sit on white chairs under an Arya Vaidya Vilasini Vaidyasala banner" },
      { src: "/content/gallery/100th-year-celebration-10.webp", width: 1280, height: 853, alt: "Guests looking at a tiered display of bottled AVVVS products on red cloth" },
      { src: "/content/gallery/100th-year-celebration-11.webp", width: 1280, height: 853, alt: "Guests handing over a memento on stage beside flower arrangements" },
      { src: "/content/gallery/100th-year-celebration-12.webp", width: 1280, height: 853, alt: "Guests greeting one another outdoors with police officers standing behind them" },
      { src: "/content/gallery/100th-year-celebration-13.webp", width: 1280, height: 853, alt: "A group of men in conversation and shaking hands" },
      { src: "/content/gallery/100th-year-celebration-14.webp", width: 1280, height: 853, alt: "Guests lighting a traditional brass lamp on stage" },
      { src: "/content/gallery/100th-year-celebration-15.webp", width: 1280, height: 853, alt: "A man presenting a framed memento to another man on stage" },
    ],
  },
];

export const galleryImageCount = galleryCategories.reduce((n, c) => n + c.images.length, 0);
