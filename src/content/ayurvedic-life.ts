import type { Block, ContentImage } from "./types";

// Source: avvvs.com/ayurvediclife (the old menu points to /ayurvediclife; /ayurvedic-life is the kept route).
// The page holds a looping silent video and two "Healthy Diet Recipe" cards. The video is not carried over.
// Kodubale is also one of the ten blog posts; Kinnathappam is a recipe post that appears only here.

export const ayurvedicLifeIntro = "Healthy diet recipes from AVVVS.";

export type Recipe = {
  slug: string;
  title: string;
  /** Set when the full recipe lives at /blog/<slug>. */
  postSlug?: string;
  published: string;
  image: ContentImage;
  ingredients?: string[];
  steps?: string[];
  notes?: Block[];
  sourceUrl: string;
};

export const recipes: Recipe[] = [
  {
    slug: "healthy-kodubale",
    title: "Healthy Kodubale (കോഡുബളെ) recipe",
    postSlug: "healthy-kodubale-%e0%b4%95%e0%b5%8b%e0%b4%a1%e0%b5%81%e0%b4%ac%e0%b4%b3%e0%b5%86-recipe",
    published: "2023-09-25T01:21:16+00:00",
    image: {
      src: "/content/ayurvedic-life/kodubale.webp",
      width: 275,
      height: 183,
      alt: "Fried ring-shaped kodubale snacks in a small metal pan on a marble surface",
    },
    sourceUrl: "https://avvvs.com/healthy-kodubale-%e0%b4%95%e0%b5%8b%e0%b4%a1%e0%b5%81%e0%b4%ac%e0%b4%b3%e0%b5%86-recipe/",
  },
  {
    slug: "kinnathappam",
    title: "Kinnathappam (കിണ്ണത്തപ്പം) steamed plate cake",
    published: "2023-09-25T01:11:13+00:00",
    image: {
      src: "/content/ayurvedic-life/kinnathappam.webp",
      width: 1280,
      height: 720,
      alt: "Square slices of white kinnathappam cake on a green banana leaf",
    },
    ingredients: [
      "1 cup raw rice, soaked",
      "1/2 cup split Bengal gram dhal, lightly cooked",
      "1 coconut, grated, with three cups of milk",
      "1.6 kg jaggery",
      "1/2 tsp cardamom, powdered",
      "Coconut flakes, fried",
      "50 g ghee",
    ],
    steps: [
      "Take a thick-bottomed vessel and boil the jaggery in 2 cups of water.",
      "Allow the jaggery to melt completely and thicken.",
      "Let it cool and sieve the jaggery syrup.",
      "Grind the rice well and add coconut milk to make a thin batter.",
      "Spread the batter and ghee onto a thick-bottomed pan on low fire, stirring continuously.",
      "Add the melted jaggery and stir.",
      "Add the Bengal gram dhal and cardamom powder.",
      "Stir until the batter leaves the bottom of the vessel.",
      "Take care not to let the batter stick to the vessel or burn.",
      "Let the ghee start draining out of the batter.",
      "Pour the mixture into a greased dish and sprinkle fried coconut flakes on top.",
      "Flatten using a spoon and cool before slicing into proper shapes.",
    ],
    notes: [
      { type: "h", level: 2, text: "Health benefits and nutritional facts" },
      { type: "ul", items: ["Calories: 407", "Carbohydrates: 67%", "Fat: 31%", "Protein: 2%"] },
      {
        type: "ul",
        items: [
          "Instant energy giving wholesome meal",
          "A standalone meal",
          "Can be taken in malnutrition and malnourishment",
          "Ingredients help digestion",
        ],
      },
    ],
    sourceUrl: "https://avvvs.com/kinnathappam-%e0%b4%95%e0%b4%bf%e0%b4%a3%e0%b5%8d%e0%b4%a3%e0%b4%a4%e0%b5%8d%e0%b4%a4%e0%b4%aa%e0%b5%8d%e0%b4%aa%e0%b4%82-steamed-plate-cake/",
  },
];
