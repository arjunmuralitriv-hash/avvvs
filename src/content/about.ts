import type { ContentImage } from "./types";

// Source: avvvs.com/about-us and avvvs.com/cosmetic. Typos fixed; the page's second Outreach paragraph is a reworded
// repeat of the first and is left out. Names, dates and countries are exactly as the source gives them.

export const aboutHero = {
  title: "About AVVVS",
  lead: "Amalgam of tradition, technology: 100 years of experience.",
};

export const aboutIntro: string[] = [
  "Arya Vaidya Vilasini Vaidya Sala is a well known entity in Kozhikode, the hub of Malabar, both as a multifaceted Ayurveda institution manufacturing, supplying, exporting and retailing quality Ayurveda classical and patent medicines. The clinical section of AVVVS grew and branched into AVVVS Speciality Clinics providing specialised Ayurveda care under expert supervision. Adapting to the evolving technology without compromising on the core tradition is the uniqueness of AVVVS, a value that has sustained and nurtured it through these 100 years.",
  "Arya Vaidya Vilasini Vaidya Sala, a landmark Ayurveda institution of Kozhikode, dates its origin to 1921, when Kaloor Neelakandan Vaidyar was personally blessed and advised by the visionary Sree Narayana Guru to employ his expertise to establish a patient care facility to benefit the ailing society. Willingly obeying the master's orders, Kaloor Neelakandan Vaidyar started the Arya Vaidya Vilasini Vaidya Sala (AVVVS) to manufacture quality medicines and deliver compassionate healthcare to the society.",
];

export const aboutImage: ContentImage = {
  src: "/content/about/amalgam.webp",
  width: 570,
  height: 502,
  alt: "Round photo collage of AVVVS factory interiors with a blue and gold Since 1921, 100 years badge in the middle",
};

export const people = [
  {
    name: "Kaloor Neelakandan Vaidyar",
    role: "Founder",
    caption: "Sri. K. Neelakandan Vaidyar (Founder)",
    text: "Arya Vaidya Vilasini Vaidya Sala was established in 1921 with the blessings of revered Sree Narayana Guru by Kaloor Neelakantan Vaidyar as a pharmacy preparing and dispensing Ayurveda medicines.",
    image: {
      src: "/content/about/neelakandan-vaidyar.webp",
      width: 251,
      height: 298,
      alt: "Sepia portrait of an older man with swept-back hair in a white shirt",
    } satisfies ContentImage,
  },
  {
    name: "K.N. Ramadas Vaidyar",
    role: "Successor",
    caption: "Sri. K.N. Ramadas Vaidyar",
    text: "Kaloor Neelakandan Vaidyar was succeeded by his son Ramdas Vaidyar, who along with continuing in his dedicated father's footsteps penetrated the socio-literary circles of Kozhikode with his satire and positive sarcasm.",
    image: {
      src: "/content/about/vaidyar.webp",
      width: 251,
      height: 301,
      alt: "Black and white portrait of a smiling older man in a white shirt",
    } satisfies ContentImage,
  },
];

export const leadershipNote = "The present management of AVVVS is under the leadership of Dr Manoj Kaloor and Reeja Manoj.";

export const profile: string[] = [
  "Arya Vaidya Vilasini Vaidya Sala is based in Kozhikode (Calicut), a city known for the legacy of compassion, hospitality and trust. The firm, shortly addressed as AVVVS, has to its credit many effective, special time tested formulations documented through the generations. It has always tried to evolve with time, incorporating the contemporary changes and trends in the industry.",
  "The present GMP-certified factory, with state-of-the-art technology and modern manufacturing equipment, is proof of its scientific approach. The factory, located in the suburbs of the city, has modern machinery for capsulation, blister packing, ointment manufacturing and filling, and cosmetic products manufacturing, apart from the traditional mechanized manufacturing units manned by trained and experienced personnel. The raw material sourcing, storing, manufacturing, packaging and logistics processes are all of international standards.",
  "Medicines manufactured at AVVVS are marketed throughout India and also exported to countries like Russia, Austria, Slovenia, Colombia, etc. The firm is all set to enter the new generation e-commerce segment with retail marketing of Ayurveda products and specialised customer support and counselling services. Arya Vaidya Vilasini Vaidya Sala is committed to develop, license manufacture and dispense safe, effective, reliable and affordable Ayurveda products globally to our clientele.",
];

export const vision =
  "To be a premium multi-faceted Ayurveda global ethical business institution committed to quality and guided by tradition. Arya Vaidya Vilasini Vaidya Sala (AVVVS) manufactures quality medicines and delivers compassionate healthcare to society.";

export const mission =
  "To achieve the vision and promote holistic positive health through Ayurveda with respect for nature and regard for life, through committed teamwork and adherence to the laws of the land. AVVVS is committed to developing, manufacturing, and exporting affordable Ayurveda products globally to our clientele.";

export const valuesIntro: string[] = [
  "The best of both worlds can be achieved if we blend together technology and tradition. We have stringent quality control measures in place so that we can use technology. AVVVS is a blessing to the fresh graduates aspiring for a successful career. The uniformity of the brand facilitates interconnected operations and is helpful for patients to seek AVVVS services wherever they go. This AVVVS chain of clinics is a giant leap by AVVVS towards women empowerment, employment generation, Ayurveda promotion, improvement of public health and research.",
];

export const values: string[] = [
  "Timely, precise, mutually respecting internal and external communication",
  "Empowering, involving, motivating and challenging workplace",
  "Adherence to quality standards and legislations",
  "Trust and transparency in all matters and at all levels",
  "Ownership, responsibility, commitment and going an extra mile with a smile",
  "Concern and compassion to health care seekers and business partners",
];

export const outreach = {
  text: "The inception concept of AVVVS is social service, which was observed to the core by the forefathers Kaloor Neelakandan Vaidyar and Ramdas Vaidyar. The present management of AVVVS, under the leadership of Dr Manoj Kaloor and Reeja Manoj, has upheld and is following the path of social service.",
  images: [
    {
      src: "/content/about/csr-activity.webp",
      width: 1280,
      height: 960,
      alt: "A woman in a green dress speaking to a classroom of seated students, with a projected slide behind her",
    },
    {
      src: "/content/about/csr-activity2.webp",
      width: 1280,
      height: 960,
      alt: "A woman with a microphone addressing rows of seated students in uniform in a large hall",
    },
  ] satisfies ContentImage[],
};

/** Key facts for the About page, each one printed on the source pages above. */
export const keyFacts: { term: string; detail: string }[] = [
  { term: "Founded", detail: "1921, by Kaloor Neelakandan Vaidyar, with the blessing of Sree Narayana Guru" },
  { term: "Run by", detail: "Dr Manoj Kaloor and Reeja Manoj" },
  { term: "Factory", detail: "GMP-certified, in the suburbs of Kozhikode" },
  { term: "Sold in", detail: "Throughout India, and exported to Russia, Austria, Slovenia and Colombia" },
  { term: "Clinics", detail: "AVVVS Ayur Specialty Clinics, Annie Hall Road, Chalappuram, Kozhikode" },
];

/** Source: avvvs.com/cosmetic. Product names and wording as printed there. */
export const cosmeticRange = {
  title: "AVVVS skin and hair care product range",
  items: [
    {
      name: "Gloveda massage oil for scar removal",
      text: "Special formula for scar removal with active plant metabolites from 45 herbs.",
      indications: "Wound and burn scars, dark spots, acne scars, post-inflammatory hyperpigmentation",
    },
    {
      name: "Gloveda face wash",
      text: "Cleansing pH balanced moisturizing formula for glowing hygienic skin fortified with anti-aging anti-oxidant Triphala.",
      indications: "Acne, blackheads, whiteheads, allergies, regular face cleaning",
    },
    {
      name: "Gloveda face wash for acne",
      text: "Skin disinfectant, oil-balancing, pH-balanced to inhibit harmful microbial activity and manage inflammation, fortified with herbs like Tulasi and Vacha.",
      indications: "Acne, acne outbreak, blackheads, whiteheads, rashes on the forehead",
    },
    {
      name: "Gloveda face scrub",
      text: "Skin nourishing and exfoliating pH-balanced formula fortified with herbs Aswagandha and Shashtika for an even tone, smooth skin.",
      indications: "Dry skin, pale skin, excessively oily skin, regular scrubbing as part of face care",
    },
    {
      name: "Gloveda anti-dandruff shampoo",
      text: "Effective pH balanced formula for scalp health, dandruff, and hair root strength, fortified with antimicrobial and vitalizing coconut oil, neem, and Danthappala.",
      indications: "Dandruff, scaling of scalp, itching of scalp, dry scalp, psoriasis patches on the scalp",
    },
    {
      name: "Gloveda face cream",
      text: "Anti-oxidant, anti-aging skin health formula for regular use. Fortified with skin-lightening herbs like Yashtimadhu, Haridra, and Manjishta.",
      indications: "Dry skin, regular face care, before and after makeup, melasma, acne scars, suntan",
    },
    {
      name: "AVVVS face pack",
      text: "100% natural formula for exfoliation, hydration, and a subtle glowing healthy appearance, fortified with herbs like Manjishta, Yashtimadhu, Laksha, and Lodhra.",
      indications: "Clogged pores, dry pale wrinkled facial skin, pigmentation, blemishes, dark spots, acne, whiteheads, blackheads, suntan, sunburn",
    },
    {
      name: "Hairgreens shampoo",
      text: "100% natural pH balanced formula for soft, smooth, strong, voluminous hair, fortified with herbs like Bhringaraja, Amla, Aloe vera, and Hibiscus.",
      indications: "Hair fall, thinning of hair, hair strangles, dry hair, split ends, premature greying, regular hair care",
    },
    {
      name: "AVVVS moisturiser",
      text: "Skin moisturizing formula for regular use. Fortified and blended with skin-cooling anti-oxidant rich herbs like Chengazhi and Pichakam.",
      indications: "Regular skin care, anti-aging, dry skin, pale skin, pigmentation, blemishes",
    },
  ],
};
