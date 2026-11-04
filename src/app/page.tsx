import type { Metadata } from "next";
import { FilmStage } from "@/components/film/FilmStage";
import { FilmCues } from "@/components/film/FilmCues";
import { CentenaryHeritage } from "@/components/home/CentenaryHeritage";
import { CuratedCollections } from "@/components/home/CuratedCollections";
import { ClinicalExperience } from "@/components/home/ClinicalExperience";
import { getFormSummaries, getSignatureCards } from "@/lib/medicines";
import { buildMetadata, JsonLd, clinicSchema } from "@/lib/seo";
import "./film/film.css";

export const metadata: Metadata = buildMetadata({
  title: "AVVVS · Luxury Ayurveda & Botanical House since 1921",
  description:
    "Rooted in the lush botanical world of Kerala since 1921. Handcrafted classical Ayurveda medicines, bell-metal compounding, and specialty clinical care in Kozhikode.",
  path: "/",
});

export default async function Home() {
  const [signatureCards, forms] = await Promise.all([
    getSignatureCards(),
    getFormSummaries(),
  ]);

  return (
    <>
      {/* Scenes 1–5: Cinematic Botanical Journey & 3D WebGL Story */}
      <div id="film-track" className="film-track scene is-live" data-scene="film">
        <FilmStage>
          <FilmCues />
        </FilmStage>
        <div
          id="site"
          tabIndex={-1}
          style={{ position: "absolute", bottom: 0, height: 1, width: 1, pointerEvents: "none" }}
        />
      </div>

      {/* Scenes 6–8: The Luxury House, Curated Collections, and Clinical Experience */}
      <div className="site-canvas">
        {/* Scene 6: Centenary Philosophy & Heritage */}
        <CentenaryHeritage />

        {/* Scene 7: Signature Formulations & Curated Collections */}
        <CuratedCollections cards={signatureCards} forms={forms} />

        {/* Scene 8: The AVVVS Experience & Specialty Clinics */}
        <ClinicalExperience />
      </div>

      <JsonLd data={clinicSchema()} />
    </>
  );
}
