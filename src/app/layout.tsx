import type { Metadata, Viewport } from "next";
import { Crimson_Pro, Hanken_Grotesk, Noto_Serif_Malayalam } from "next/font/google";
import { ViewTransition } from "react";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CartProvider } from "@/components/store/CartProvider";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo";
import { SITE_URL, org } from "@/lib/site";

const crimson = Crimson_Pro({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-crimson", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-hanken", display: "swap" });
const malayalam = Noto_Serif_Malayalam({ subsets: ["malayalam"], weight: ["400"], variable: "--font-ml", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${org.shortName}, Ayurveda medicines and clinics in Kozhikode since 1921`, template: `%s · ${org.shortName}` },
  description:
    "Arya Vaidya Vilasini Vaidya Sala makes over 300 classical and proprietary Ayurveda formulations and runs specialty clinics in Kozhikode, Kerala.",
  applicationName: org.shortName,
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = { themeColor: "#f3ecdc", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${crimson.variable} ${hanken.variable} ${malayalam.variable}`}>
      <body>
        <CartProvider>
        <a href="#main" className="skip-link">Skip to content</a>
        <Nav />
        <ViewTransition default="page">
          <main id="main">{children}</main>
        </ViewTransition>
        <Footer />
        <SmoothScroll />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        </CartProvider>
      </body>
    </html>
  );
}
