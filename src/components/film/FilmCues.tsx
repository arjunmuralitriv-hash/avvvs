import Image from "next/image";
import Link from "next/link";
import { plates } from "@/content/plates";

export function FilmCues() {
  return (
    <>
      {/* S01: Into the origins */}
      <section className="cue cue--title" data-cue="s01.title" data-on="true">
        <span className="cue__eyebrow">Centenary Vaidya Sala · Kozhikode, 1921</span>
        <h1 className="cue__display">Ayurveda since 1921</h1>
        <p className="cue__lead">
          Classical Ayurveda medicines and botanical treatment formulations prepared in Kozhikode.
        </p>
      </section>

      <section className="cue" data-cue="s01.head">
        <span className="cue__eyebrow">The Western Ghats Canopy</span>
        <h2 className="cue__head">Rooted in nature. Refined through tradition.</h2>
      </section>

      <section className="cue" data-cue="s01.caption">
        <span className="cue__eyebrow">Botanical Intelligence</span>
        <p className="cue__caption">
          Karinochi · <i>Vitex negundo</i>. One of three sacred leaves harvested for Elakizhi fomentation.
        </p>
      </section>

      {/* S02: The botanical archive */}
      <section className="cue cue--parchment" data-cue="s02.head">
        <span className="cue__eyebrow">Historical Malabar Archive</span>
        <h2 className="cue__head">Plants of Malabar, 1678</h2>
        <p className="cue__lead">Recorded from 1678. Active in our classical pharmacopoeia today.</p>
        <p className="cue__caption">
          Copperplate engravings from <i>Hortus Malabaricus</i>, Hendrik van Rheede&apos;s landmark twelve-volume record of the medicinal flora of Kerala.
        </p>
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
              <p className="cue__caption">{pl.common} · {pl.malayalam}</p>
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
        <span className="cue__eyebrow">Stage 03 · Extraction &amp; Choornam</span>
        <h2 className="cue__head">Ground into micro-choornam. Steeping active essences.</h2>
        <p className="cue__caption">
          Sun-dried <i>Zingiber officinale</i> and wild roots pulverized to micronized fineness before slow decantation into sesame oils.
        </p>
      </section>

      {/* S04: The alchemy of nature */}
      <section className="cue" data-cue="s04.head">
        <span className="cue__eyebrow">Stage 04 · The Alchemy of the Uruli</span>
        <h2 className="cue__head">Over 300 formulations compounded in bell-metal.</h2>
        <p className="cue__caption">
          Compounded over aromatic medicinal wood embers in hand-beaten bronze urulis at our GMP-certified facility in Kozhikode.
        </p>
      </section>

      {/* S05: The AVVVS reveal */}
      <section className="cue" data-cue="s05.head">
        <span className="cue__eyebrow">Stage 05 · Signature Formulations</span>
        <h2 className="cue__head">Rujanth, Mezhu Thailam &amp; Lakshol</h2>
        <p className="cue__caption">
          Centenary formulas bottled with unadulterated botanical potency. Every batch tested for purity and classical integrity.
        </p>
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
          <Link href="/products/red-irons-capsule" className="cue__product-card">
            <div className="cue__product-visual">
              <Image
                src="/content/gallery/red-irons.webp"
                alt="Red Irons Capsule bottle"
                width={72}
                height={72}
                className="cue__product-img"
              />
            </div>
            <div className="cue__product-meta">
              <strong className="cue__product-title">Red Irons</strong>
              <span className="cue__product-sub">Classical restorative</span>
            </div>
          </Link>
        </div>
      </section>

      {/* S06: Beyond the film handoff */}
      <section className="cue cue--parchment" data-cue="handoff.note">
        <span className="cue__eyebrow">The AVVVS Pharmacopoeia</span>
        <h2 className="cue__head">Centenary Ayurvedic Care</h2>
        <p className="cue__lead">
          From wild Kerala harvests to physician-formulated medicines. Handcrafted in Kozhikode since 1921.
        </p>
        <div className="cue__links">
          <Link href="#site" className="btn btn--primary">
            Explore the House ↓
          </Link>
          <Link href="/store" className="btn">
            Browse Store →
          </Link>
        </div>
      </section>
    </>
  );
}
