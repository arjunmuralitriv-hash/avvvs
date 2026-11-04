import type { Clinic, ContentImage } from "./types";

// Source: avvvs.com/avvvs-speciality-clinic. Shouting capitals are set in sentence case and typos are fixed.
// Where the source breaks off mid-sentence, the broken fragment is left out (see notes in the build report).
// Pain Management, Obesity Management and Male and Female Infertility are listed on the source page by heading only;
// only Obesity Management has text, in the page introduction.

export const clinicsIntro: string[] = [
  "Revitalising your health and youth with century trusted authentic Ayurveda care by specialised doctors.",
  "We highlight the specialty treatments available for different conditions like headache, pain management, obesity management, women health problems, lifestyle diseases, skin and hair problems and post natal care, under specialised doctors.",
  "We provide authentic Panchakarma treatments and anti-aging Keraleeya Panchakarma therapies like Sarvanga Abhyanga, Pizhichil, Shirodhara, Elakizhi, Njavarakizhi, Udhwarthana and more.",
  "The skin and hair care clinic is modulated in a different way, so that it combines the unique Ayurvedic skin care formulations with technologically equipped skin care machines. Anti-aging, skin tightening, collagen boosting, acne clearing and hyperpigmentation reducing treatments are done under a specialised group of doctors. Hair fall, dandruff and hair thinning problems are treated under this type of treatment.",
  "Our obesity management clinic also combines the Ayurveda way of body contouring, like Udhwarthana or Uthsadana procedures, with cryolipolysis, RF body contouring and lipolaser techniques. Diet modifications and exercises also form part of the treatment course. Stubborn fat is reduced by the machines used, while the whole body is contoured by Ayurveda procedures.",
  "Our OP based post natal care is very much needed for new generation moms.",
  "Located in the middle of Kozhikode city, opposite the railway station, our centre is the place to relax, refresh and rejuvenate in the day-to-day hectic lifestyle.",
];

export const clinicChain: string[] = [
  "Arya Vaidya Vilasini Vaidya Sala is a well-known entity in Kozhikode, the hub of Malabar, both as a multifaceted Ayurveda institution manufacturing, supplying, exporting, and retailing quality Ayurveda classical and patent medicines. The clinical section of AVVVS grew and branched into AVVVS Specialty Clinic providing specialized Ayurveda care under expert supervision. Adapting to the evolving technology without compromising on the core tradition is the uniqueness of AVVVS, a value that has sustained and nurtured it through these 100 years.",
  "Arya Vaidya Vilasini Vaidya Sala owns and operates a chain of outpatient clinics in various Ayurveda specialties and treatments under the brand name AVVVS Specialty Clinic. The specialties offered are Head Ache Clinic, ENT Clinic, Eye Care Clinic, Health and Beauty Clinic, Women Health Clinic, Pregnancy and Post Natal Care Clinic, Child Health Clinic, and Lifestyle Clinic. The clinics offer specialty outpatient wellness and curative health care services. A few more specialties are in the pipeline to be launched shortly.",
  "Premium category AVVVS Specialty Clinic Ayurveda Centres are operated in association with various stakeholders of the premium wellness, leisure and hospitality sectors. More associations of the kind are planned for the coming years.",
];

const icon = (file: string, w: number, h: number, alt: string): ContentImage => ({
  src: `/content/clinics/${file}.webp`,
  width: w,
  height: h,
  alt,
});

export const clinics: Clinic[] = [
  {
    slug: "women-health",
    name: "Women Health Clinic",
    paragraphs: [
      "The Women Health Clinic delivers Ayurveda care and a method of living, and has helped women successfully manage health issues.",
    ],
    headingOnly: false,
    lead: "Ayurveda care and a method of living for women's health issues.",
    treatments: ["pizhichil"],
    related: ["pregnancy-and-post-natal-care", "skin-and-hair-care"],
    image: icon("women-health-clinic", 570, 243, "White pictogram of a woman's face in profile inside a blue circle"),
    source: "avvvs.com/avvvs-speciality-clinic",
  },
  {
    slug: "skin-and-hair-care",
    name: "Skin and Hair Care Clinic",
    paragraphs: [
      "Ayurveda has given importance to the inner beauty that reflects out as a glow. At AVVVS, Ayurveda face and skin therapies and treatment for chronic skin conditions are provided using herbal skin care products. AVVVS always ensures quality in the ingredients, processing, and packaging of skin and hair care products. Skin and hair care is individualistic and customized at AVVVS.",
      "The clinic combines the unique Ayurvedic skin care formulations with technologically equipped skin care machines. Anti-aging, skin tightening, collagen boosting, acne clearing and hyperpigmentation reducing treatments are done under a specialised group of doctors. Hair fall, dandruff and hair thinning problems are treated under this type of treatment.",
    ],
    headingOnly: false,
    lead: "Face and skin therapies and treatment for chronic skin conditions, using herbal products.",
    treatments: ["vadana-kanthi", "kesha-kanthi", "mrudu-sparsha", "sareera-kanthi"],
    related: ["women-health", "lifestyle-diseases"],
    image: icon("women-health-clinic-2", 573, 276, "White pictogram of a woman with flowing hair inside a white circle, in blue"),
    source: "avvvs.com/avvvs-speciality-clinic",
  },
  {
    slug: "headache",
    name: "Headache Clinic",
    paragraphs: [
      "Headache is one of the most common health issues faced in day-to-day life by almost everyone many times during their lives. Pain and tension on the head and face are the presenting symptoms. Cluster headaches, tension headaches, sinusitis, and migraine are common types of headaches.",
      "Most headaches are not dangerous and pass off. Persisting headaches may be a sign of a serious underlying condition and have to be medically evaluated and managed.",
    ],
    headingOnly: false,
    lead: "Cluster headaches, tension headaches, sinusitis and migraine.",
    treatments: ["shirodhara"],
    related: ["pain-management", "lifestyle-diseases"],
    image: icon("women-health-clinic-3", 570, 316, "White pictogram of a head in profile with a lightning bolt inside, in a blue circle"),
    source: "avvvs.com/avvvs-speciality-clinic",
  },
  {
    slug: "lifestyle-diseases",
    name: "Lifestyle Diseases Clinic",
    paragraphs: [
      "Lifestyle diseases are defined as the health problems that arise from unhealthy changes in lifestyle, habitat, and food. Increasing sedentary lifestyles, untimely job requirements, unhealthy food habits, addictions, stress, and unnecessary medication are the main culprits against a healthy life.",
      "AVVVS Lifestyle Clinic primarily aims to redefine lifestyles individualistically and prescribe a healthy lifestyle formula suiting the person's life and work.",
    ],
    headingOnly: false,
    lead: "Redefines lifestyle individually and prescribes a healthy lifestyle formula.",
    treatments: ["abhyanga"],
    related: ["obesity-management", "headache"],
    image: icon("women-health-clinic-4", 575, 278, "White figure with raised arms beside leaves, in a blue circle"),
    source: "avvvs.com/avvvs-speciality-clinic",
  },
  {
    slug: "pregnancy-and-post-natal-care",
    name: "Pregnancy and Post Natal Care Clinic",
    paragraphs: [
      "Motherhood is the gift of nature for a woman. A mother's health is very important and vital for the health of the child and family. Ayurveda places a great emphasis on the value of caring for the mother prior to, during and following pregnancy.",
      "Pregnancy month-wise care and post-natal care include diet, medicines, therapies, education, and mental support for the mother and family.",
      "Our OP based post natal care is very much needed for new generation moms.",
    ],
    headingOnly: false,
    lead: "Month-wise care in pregnancy, and post-natal care.",
    treatments: ["pizhichil"],
    related: ["women-health", "lifestyle-diseases"],
    image: icon("womens-health-clinic-5", 573, 277, "White outline of a mother holding a baby, in a light blue circle"),
    source: "avvvs.com/avvvs-speciality-clinic",
  },
  {
    slug: "pain-management",
    name: "Pain Management Clinic",
    paragraphs: [],
    headingOnly: true,
    lead: "Listed on the clinic page among the specialty clinics.",
    treatments: ["elakizhi", "podikizhi", "naranga-kizhi", "njavarakizhi", "pizhichil"],
    related: ["headache", "obesity-management"],
    source: "avvvs.com/avvvs-speciality-clinic",
  },
  {
    slug: "obesity-management",
    name: "Obesity Management Clinic",
    paragraphs: [
      "The obesity management clinic combines the Ayurveda way of body contouring, like Udhwarthana or Uthsadana procedures, with cryolipolysis, RF body contouring and lipolaser techniques.",
      "Diet modifications and exercises also form part of the treatment course. Stubborn fat is reduced by the machines used, while the whole body is contoured by Ayurveda procedures.",
    ],
    headingOnly: false,
    lead: "Ayurveda body contouring with cryolipolysis, RF body contouring and lipolaser techniques.",
    treatments: ["udvarthana", "podikizhi"],
    related: ["lifestyle-diseases", "pain-management"],
    source: "avvvs.com/avvvs-speciality-clinic",
  },
  {
    slug: "male-and-female-infertility",
    name: "Male and Female Infertility Clinic",
    paragraphs: [],
    headingOnly: true,
    lead: "Listed on the clinic page among the specialty clinics.",
    treatments: [],
    related: ["women-health", "pregnancy-and-post-natal-care"],
    source: "avvvs.com/avvvs-speciality-clinic",
  },
];

export const getClinic = (slug: string) => clinics.find((c) => c.slug === slug);
