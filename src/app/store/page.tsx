import type { Metadata } from "next";
import { getMedicines, getFormSummaries, getSignatureCards } from "@/lib/medicines";
import { buildMetadata, JsonLd, breadcrumbSchema } from "@/lib/seo";
import { StoreHead } from "@/components/store/StoreHead";
import { SignatureBand } from "@/components/store/SignatureBand";
import { FormIndex } from "@/components/store/FormIndex";
import { StoreIndexLinks } from "@/components/store/StoreIndexLinks";
import { AdviceBand } from "@/components/store/AdviceBand";

export const metadata: Metadata = buildMetadata({
  title: "Medicines · Classical & Proprietary Formulations",
  description:
    "Over 160 classical and proprietary Ayurveda medicines from Arya Vaidya Vilasini Vaidya Sala, Kozhikode, since 1921. Thailams, kashayams, arishtams and more, by form.",
  path: "/store",
});

export default async function StorePage() {
  const [medicines, forms, signatureCards] = await Promise.all([
    getMedicines(),
    getFormSummaries(),
    getSignatureCards(),
  ]);

  const proprietaryCount = medicines.filter((m) =>
    m.collections.includes("proprietary")
  ).length;

  return (
    <>
      <div className="container">
        <StoreHead count={medicines.length} />
        <SignatureBand cards={signatureCards} />
        <FormIndex forms={forms} />
        <StoreIndexLinks
          totalCount={medicines.length}
          proprietaryCount={proprietaryCount}
        />
      </div>
      <AdviceBand />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Medicines",
            url: "https://www.avvvs.com/store",
          },
          breadcrumbSchema([{ name: "Store", path: "/store" }]),
        ]}
      />
    </>
  );
}
