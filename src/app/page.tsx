import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { StoryTrack } from "@/components/story/StoryTrack";
import { StoryStage } from "@/components/story/StoryStage";
import { chapters, shelves, storyHero } from "@/content/story";
import { clinic, telHref } from "@/lib/site";
import { buildMetadata, JsonLd, clinicSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AVVVS, Ayurveda medicines and clinics in Kozhikode since 1921",
  description:
    "From herbs picked in Kerala to medicine on the shelf: Arya Vaidya Vilasini Vaidya Sala makes over 300 Ayurveda formulations and runs specialty clinics in Kozhikode.",
  path: "/",
});

// A chapter still exists once Agent B captures it from the 3D scene; until then the chapter is text only.
function still(n: number) {
  const rel = `/story/ch-${n}.avif`;
  return fs.existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

export default function Home() {
  const heroStill = still(0);
  return (
    <>
      <StoryTrack chapterCount={chapters.length + 1}>
        <StoryStage />

        {/* Chapter 0, the hero (Poster) */}
        <section className="story__step story__step--hero" data-step="0" aria-labelledby="hero-title">
          {heroStill ? <Image className="story__still" src={heroStill} alt="" fill priority sizes="100vw" /> : null}
          <div className="container story__copy-wrap">
            <div className="story__copy story__copy--hero">
              <h1 id="hero-title">{storyHero.title}</h1>
              <p className="lead">{storyHero.lead}</p>
              <div className="hero__actions">
                <Link href="/consultation" className="btn btn--primary">Book a consultation</Link>
                <Link href="/store" className="btn">Shop medicines</Link>
              </div>
            </div>
          </div>
        </section>

        <ol className="story__chapters" aria-label="How AVVVS medicine is made">
          {chapters.map((c) => {
            const s = still(c.n);
            return (
              <li
                key={c.n}
                className="story__step"
                data-step={c.n}
                data-tone={c.tone}
                aria-labelledby={`ch-${c.n}`}
              >
                {s ? <Image className="story__still" src={s} alt="" fill sizes="100vw" /> : null}
                <div className="container story__copy-wrap">
                  <div className="story__copy">
                    <h2 id={`ch-${c.n}`}>
                      <span className="story__num">{c.n}.</span> {c.title}
                    </h2>
                    <p className="lead">{c.body}</p>
                    {c.facts ? (
                      <dl className="story__facts">
                        {c.facts.map((f) => (
                          <div key={f.term}>
                            <dt>{f.term}</dt>
                            <dd>{f.latin ? <i>{f.detail}</i> : f.detail}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {c.scene === "almirah" ? (
                      <ul className="story__shelves" aria-label="Shop by kind of medicine">
                        {shelves.map((s) => (
                          <li key={s.type}>
                            <Link className="chip" href={`/store?type=${s.type}`}>{s.label}</Link>
                          </li>
                        ))}
                        <li><Link className="btn btn--primary" href="/store">Open the store</Link></li>
                      </ul>
                    ) : null}
                    {c.scene === "clinic" ? (
                      <div className="story__slots" role="group" aria-label="Consultation times">
                        {clinic.timeSlots.map((t) => (
                          <Link key={t.id} className="btn btn--primary" href={`/consultation?slot=${t.id}`}>
                            Book {t.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </StoryTrack>

      {/* Hours and the address, a section of their own */}
      <section className="section visit" aria-labelledby="visit-title">
        <div className="container grid-12">
          <div className="visit__head">
            <h2 id="visit-title">Find the clinic</h2>
            <p className="lead">{clinic.landmark}, in the middle of Kozhikode.</p>
          </div>
          <dl className="visit__rows">
            <div>
              <dt>Address</dt>
              <dd>
                {clinic.name}<br />
                {clinic.street}, {clinic.locality}<br />
                {clinic.city}, {clinic.region} {clinic.postalCode}
              </dd>
            </div>
            <div>
              <dt>Consultation times</dt>
              <dd>
                {clinic.timeSlots.map((t) => (
                  <span key={t.id} className="num" style={{ display: "block" }}>{t.label}</span>
                ))}
              </dd>
            </div>
            <div>
              <dt>Call</dt>
              <dd>
                {clinic.phones.map((p) => (
                  <a key={p} className="link num" href={telHref(p)} style={{ display: "block" }}>{p}</a>
                ))}
              </dd>
            </div>
            <div>
              <dt>Write</dt>
              <dd><a className="link" href={`mailto:${clinic.email}`}>{clinic.email}</a></dd>
            </div>
          </dl>
          <div className="visit__actions">
            <Link className="btn btn--primary" href="/consultation">Book a consultation</Link>
            <a
              className="btn"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name}, ${clinic.street}, ${clinic.city} ${clinic.postalCode}`)}`}
              rel="noopener"
            >
              Open in Maps
            </a>
          </div>
        </div>
      </section>

      <JsonLd data={clinicSchema()} />
    </>
  );
}
