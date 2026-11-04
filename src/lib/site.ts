// Single source of truth for facts about AVVVS.
// Every value here comes from avvvs.com (Wayback snapshots, May–Jul 2026) or avvvsglobal.com.
// Do not add facts that are not on those sites.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.avvvs.com";

export const org = {
  name: "Arya Vaidya Vilasini Vaidya Sala",
  shortName: "AVVVS",
  legalName: "Arya Vaidya Vilasini Vaidya Sala",
  foundingYear: 1921,
  founder: "Kaloor Neelakantan Vaidyar",
  successor: "K.N. Ramadas Vaidyar",
  leadership: ["Dr Manoj Kaloor", "Reeja Manoj"],
  blessing: "Sree Narayana Guru",
  formulations: "300+",
  customers: "500k+",
  exportCountries: ["Russia", "Austria", "Slovenia", "Colombia"],
  signatureProducts: ["Mezhu Thailam", "Rujanth", "Slepan", "Redirons", "Lakshol"],
  certifications: ["GMP-certified factory"],
  tagline: "Trust in Ayur Science",
} as const;

export const clinic = {
  name: "AVVVS Ayur Specialty Clinics",
  street: "60/3829/A, Annie Hall Road",
  locality: "Chalappuram PO",
  city: "Kozhikode",
  region: "Kerala",
  postalCode: "673002",
  country: "IN",
  landmark: "Opposite Kozhikode railway station",
  email: "mail@avvvs.com",
  phones: ["+91 8089202091", "+91 9037514016"],
  // From the existing booking form's time-slot options.
  timeSlots: [
    { id: "morning", label: "9:00 AM – 1:00 PM", opens: "09:00", closes: "13:00" },
    { id: "afternoon", label: "2:00 PM – 5:00 PM", opens: "14:00", closes: "17:00" },
  ],
  // From the existing booking form's doctor options. Add doctors here.
  doctors: [{ id: "dr-arun", name: "Dr Arun" }],
} as const;

export const social = {
  facebook: "https://www.facebook.com/aryavaidyavilasini",
  instagram: "https://www.instagram.com/avvvsglobal/",
  x: "https://www.twitter.com/avvvsglobal",
} as const;

export const external = {
  store: "https://avvvsglobal.com",
  gloveda: "https://glovedaherbals.com/",
} as const;

export const nav = [
  { href: "/avvvs-speciality-clinic", label: "Clinics" },
  { href: "/treatments", label: "Treatments" },
  { href: "/store", label: "Store" },
  { href: "/about-us", label: "About" },
  { href: "/blog", label: "Journal" },
] as const;

export const footerNav = [
  { href: "/about-us", label: "About" },
  { href: "/avvvs-speciality-clinic", label: "Ayur Speciality Clinic" },
  { href: "/treatments", label: "Wellness treatments" },
  { href: "/ayurvedic-life", label: "Ayurvedic life" },
  { href: "/store", label: "Store" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonial", label: "Testimonials" },
  { href: "/blog", label: "Journal" },
  { href: "/consultation", label: "Book a consultation" },
  { href: "/contact-us", label: "Contact" },
] as const;

export const telHref = (p: string) => `tel:${p.replace(/\s+/g, "")}`;
export const waHref = (p: string) => `https://wa.me/${p.replace(/\D/g, "")}`;
