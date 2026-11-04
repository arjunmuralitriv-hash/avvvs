import { FilmStage } from "@/components/film/FilmStage";
import { plates } from "@/content/plates";
import { buildMetadata } from "@/lib/seo";
import "./film.css";

export const metadata = buildMetadata({
  title: "The film (prototype)",
  description: "Prototype of the AVVVS film: from the Kerala forest to the plates of Hortus Malabaricus.",
  path: "/film",
  noindex: true,
});

// Copy: docs/plan/01-creative-direction.md §4.2 (verified lines only).
export default function FilmPage() {
  return (
    <div id="film-track" className="film-track">
      <FilmStage>
        <section className="cue cue--title" data-cue="s01.title">
          <h1 className="cue__display">Ayurveda since 1921</h1>
          <p className="cue__lead">Arya Vaidya Vilasini Vaidya Sala, Kozhikode.</p>
        </section>
        <section className="cue" data-cue="s01.head">
          <h2 className="cue__head">Rooted in nature. Refined through tradition.</h2>
        </section>
        <section className="cue" data-cue="s01.caption">
          <p className="cue__caption">Karinochi, <i>Vitex negundo</i>. One of three leaves we use for Elakizhi.</p>
        </section>
        <section className="cue cue--parchment" data-cue="s02.head">
          <h2 className="cue__head">Plants of Malabar, recorded from 1678. Still in our medicines.</h2>
          <p className="cue__caption">Engravings from <i>Hortus Malabaricus</i>, Hendrik van Rheede&apos;s book of the plants of this coast.</p>
        </section>
        {plates.map((pl, i) => (
          <section key={pl.slug} className={`cue cue--parchment cue--plate ${i % 2 ? "cue--right" : ""}`} data-cue={`s02.plate.${i}`}>
            <p className="cue__ref">{pl.reference}</p>
            <h2 className="cue__head">{pl.sanskrit}</h2>
            <p className="cue__binomial"><i>{pl.binomial}</i></p>
            <p className="cue__caption">{pl.common}. {pl.malayalam}.</p>
            <p className="cue__in">In {pl.products.map((p) => p.name).join(", ")}</p>
          </section>
        ))}
      </FilmStage>
    </div>
  );
}
