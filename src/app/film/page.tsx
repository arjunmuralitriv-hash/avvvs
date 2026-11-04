import Image from "next/image";
import Link from "next/link";
import { FilmStage } from "@/components/film/FilmStage";
import { plates } from "@/content/plates";
import { buildMetadata } from "@/lib/seo";
import "./film.css";

export const metadata = buildMetadata({
  title: "The film (prototype)",
  description: "Experience the AVVVS film: from the Kerala forest and Hortus Malabaricus to classical compounding and medicines.",
  path: "/film",
  noindex: true,
});

// Copy: docs/plan/01-creative-direction.md §4.2 & 02-storyboard.md §9.1.
export default function FilmPage() {
  return (
    <div id="film-track" className="film-track scene is-live" data-scene="film">
      <FilmStage>
        {/* S01: Into the origins */}
        <section className="cue cue--title" data-cue="s01.title" data-on="true">
          <h1 className="cue__display">Ayurveda since 1921</h1>
          <p className="cue__lead">Classical Ayurveda medicines &amp; treatment formulations prepared in Kozhikode.</p>
        </section>

        <section className="cue" data-cue="s01.head">
          <h2 className="cue__head">Rooted in nature. Refined through tradition.</h2>
        </section>

        <section className="cue" data-cue="s01.caption">
          <p className="cue__caption">Karinochi, <i>Vitex negundo</i>. One of three leaves we use for Elakizhi.</p>
        </section>

        {/* S02: The botanical archive */}
        <section className="cue cue--parchment" data-cue="s02.head">
          <h2 className="cue__head">Plants of Malabar, 1678</h2>
          <p className="cue__lead">Recorded from 1678. Still in our medicines.</p>
          <p className="cue__caption">Engravings from <i>Hortus Malabaricus</i>, Hendrik van Rheede&apos;s book of the plants of this coast.</p>
        </section>

        {plates.map((pl, i) => (
          <section
            key={pl.slug}
            className="cue cue--parchment cue--plate"
            data-cue={`s02.plate.${i}`}
          >
            <div className="cue__plate-card">
              <div className="cue__plate-body">
                <p className="cue__ref">{pl.reference}</p>
                <h2 className="cue__head">{pl.sanskrit}</h2>
                <p className="cue__binomial"><i>{pl.binomial}</i></p>
                <p className="cue__caption">{pl.common}. {pl.malayalam}.</p>
                <p className="cue__in">
                  In{" "}
                  {pl.products.map((p, idx) => (
                    <span key={p.handle}>
                      {idx > 0 ? ", " : ""}
                      <Link href={`/products/${p.handle}`} className="cue__link">
                        {p.name}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
              <div className="cue__plate-visual">
                <Image
                  src={`/plates/${pl.slug}-1024.webp`}
                  alt={`Archival engraving of ${pl.common} (${pl.binomial}), Hortus Malabaricus 1678`}
                  width={140}
                  height={180}
                  className="cue__plate-thumb"
                />
              </div>
            </div>
          </section>
        ))}

        {/* S03: From illustration to extraction */}
        <section className="cue" data-cue="s03.head">
          <h2 className="cue__head">Ground into choornam. Cooked slowly into thailam.</h2>
          <p className="cue__caption">Mezhu Thailam is one of the formulae handed down at AVVVS.</p>
        </section>

        {/* S04: The alchemy of nature */}
        <section className="cue" data-cue="s04.head">
          <h2 className="cue__head">Over 300 formulations, classical and our own.</h2>
          <p className="cue__caption">Made at our GMP-certified factory in Kozhikode.</p>
        </section>

        {/* S05: The AVVVS reveal */}
        <section className="cue" data-cue="s05.head">
          <h2 className="cue__head">Rujanth, Mezhu Thailam &amp; Lakshol</h2>
          <p className="cue__caption">Three of the medicines AVVVS is known for. Each label lists what is inside.</p>
        </section>

        <section className="cue cue--wide" data-cue="s05.productNames">
          <div className="cue__packshot-grid">
            <Link href="/products/rujanth-linment" className="cue__product-card">
              <div className="cue__product-visual">
                <Image
                  src="/content/gallery/rujanth-1.webp"
                  alt="Rujanth Liniment bottle"
                  width={72}
                  height={72}
                  className="cue__product-img"
                />
              </div>
              <div className="cue__product-meta">
                <strong className="cue__product-title">Rujanth Liniment</strong>
                <span className="cue__product-sub">Classical relieving oil</span>
              </div>
            </Link>
            <Link href="/products/mezhuthailam" className="cue__product-card">
              <div className="cue__product-visual">
                <Image
                  src="/content/blog/avvvs-mezhu-thailam-the-sure-shot-remedy-for-aches-and-pains.webp"
                  alt="Mezhu Thailam bottle"
                  width={72}
                  height={72}
                  className="cue__product-img"
                />
              </div>
              <div className="cue__product-meta">
                <strong className="cue__product-title">Mezhu Thailam</strong>
                <span className="cue__product-sub">Heritage formulation</span>
              </div>
            </Link>
          </div>
        </section>

        {/* S06: Beyond the film handoff */}
        <section className="cue" data-cue="handoff.note">
          <p className="cue__lead">Scenes painted for this film. Medicines are made at our factory in Kozhikode.</p>
          <div className="cue__links">
            <Link href="/store" className="btn btn--primary">
              Enter the Pharmacopoeia →
            </Link>
          </div>
        </section>
      </FilmStage>
      <div id="site" tabIndex={-1} style={{ position: "absolute", bottom: 0, height: 1, width: 1, pointerEvents: "none" }} />
    </div>
  );
}
