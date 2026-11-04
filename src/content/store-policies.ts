export type StorePolicy = {
  title: string;
  body: string;
};

export const storePolicies: Record<string, StorePolicy> = {
  shipping: {
    title: "Shipping & Delivery",
    body: "Orders are dispatched directly from our GMP-certified facility in Kozhikode, Kerala. Estimated delivery within 3–4 business days across India following dispatch.",
  },
  returns: {
    title: "Returns & Restocking",
    body: "Unopened medicines in their original tamper-evident packaging can be returned within 30 days of delivery. Authentic quality assured.",
  },
  quality: {
    title: "Authentic GMP Manufacture",
    body: "Every formulation is manufactured according to classical Ayurvedic treatises and GMP certified pharmaceutical standards in Kozhikode since 1921.",
  },
};

