import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist, Noto_Serif_Malayalam } from "next/font/google";
import { ViewTransition } from "react";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { CartProvider } from "@/components/store/CartProvider";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo";
import { SITE_URL, org } from "@/lib/site";

const boska = localFont({
  src: [
    { path: "./fonts/boska/Boska-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/boska/Boska-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/boska/Boska-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/boska/Boska-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-boska",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const malayalam = Noto_Serif_Malayalam({
  subsets: ["malayalam"],
  weight: ["400"],
  variable: "--font-noto-serif-ml",
  display: "swap",
  preload: false,
});

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
    <html lang="en-IN" className={`${boska.variable} ${geist.variable} ${malayalam.variable}`}>
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
