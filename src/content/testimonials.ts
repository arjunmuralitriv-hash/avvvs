import type { Testimonial } from "./types";

// Source: avvvs.com/testimonial ("What Our Clients Say").
// The page prints three quotes and no names, dates or places. They are kept apart from `testimonials` because
// nothing on the page says who wrote them; the page that shows them says so plainly.

/** Testimonials that carry a name on the source page. None do. */
export const testimonials: Testimonial[] = [];

/** Quotes printed on the source page with no attribution. Spelling and wording are the source's. */
export const unattributedQuotes: Testimonial[] = [
  {
    quote:
      "I hurt myself while playing football the other day. I was looking for something that can give me a quick pain relief when I came across Rujanth liniment. I have never gotten a quicker relief from a medicine like this one. And the fact that it's all ayurvedic is a huge bonus. I highly recommend everybody to buy this product and keep it at your home in your medicine box.",
    attribution: null,
  },
  {
    quote:
      "IT profession had been wreaking havoc with my sleep and had been causing a lot of stress. I was prescribed Slepan Capsules and Aswagandharishtam of AVVVS through online consultation. I am much much better. Those who wish to discipline yourself into a healthy routine, AVVVS is my recommendation.",
    attribution: null,
  },
  {
    quote:
      "My sports injury on my left knee was nagging me for years. A doctor prescribed me Rujanth Capsules and Lakshol liniment of AVVVS. I used the same for months. My pain is much better and I am able to resume my sports moderately. Thank you for the same AVVVS and my good doctor.",
    attribution: null,
  },
];
