import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { buildMetadata, JsonLd, breadcrumbSchema, ids, abs } from "@/lib/seo";
import {
  aboutHero,
  aboutIntro,
  aboutImage,
  people,
  leadershipNote,
  profile,
  vision,
  mission,
  valuesIntro,
  values,
  outreach,
  keyFacts,
} from "@/content";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "About AVVVS",
  description:
    "Arya Vaidya Vilasini Vaidya Sala was founded in Kozhikode in 1921 by Kaloor Neelakandan Vaidyar with the blessing of Sree Narayana Guru. Read its history, vision, mission and values.",
  path: "/about-us",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about-us" },
];

export default function AboutPage() {
  return (
    <>
      <div className="container">
        <Breadcrumbs items={crumbs} />
      </div>

      <header className={`container ${styles.head}`}>
        <h1>{aboutHero.title}</h1>
        <p className="lead">{aboutHero.lead}</p>
      </header>

      {/* Key facts: a ruled table */}
      <section className={`container ${styles.facts}`} aria-labelledby="facts-title">
        <h2 id="facts-title">Key facts</h2>
        <dl>
          {keyFacts.map((f) => (
            <div key={f.term}>
              <dt>{f.term}</dt>
              <dd>{f.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Story: text with a round collage */}
      <section className={`section ${styles.story}`} aria-labelledby="story-title">
        <div className="container grid-12">
          <div className={styles.storyText}>
            <h2 id="story-title">Since 1921</h2>
            {aboutIntro.map((t) => (
              <p key={t.slice(0, 24)}>{t}</p>
            ))}
          </div>
          <div className={styles.storyImage}>
            <Image src={aboutImage.src} alt={aboutImage.alt} width={aboutImage.width} height={aboutImage.height} sizes="(max-width: 60rem) 100vw, 40vw" />
          </div>
        </div>
      </section>

      {/* People: two portrait rows */}
      <section className="band band--paper" aria-labelledby="people-title">
        <div className="container">
          <h2 id="people-title">Founder and successor</h2>
          <ul className={styles.people}>
            {people.map((p) => (
              <li key={p.name}>
                <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="160px" />
                <div>
                  <h3>{p.name}</h3>
                  <p className="label">{p.role}</p>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.leadership}>{leadershipNote}</p>
        </div>
      </section>

      {/* Company profile */}
      <section className="section" aria-labelledby="profile-title">
        <div className="container grid-12">
          <h2 id="profile-title" className={styles.profileHead}>
            Company profile and legacy
          </h2>
          <div className={styles.profileText}>
            {profile.map((t) => (
              <p key={t.slice(0, 24)}>{t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Vision and mission: ruled index rows */}
      <section className="container" aria-label="Vision and mission">
        <dl className={styles.vm}>
          <div>
            <dt>
              <h2>Our vision</h2>
            </dt>
            <dd>{vision}</dd>
          </div>
          <div>
            <dt>
              <h2>Our mission</h2>
            </dt>
            <dd>{mission}</dd>
          </div>
        </dl>
      </section>

      {/* Values: numbered list */}
      <section className="section" aria-labelledby="values-title">
        <div className="container grid-12">
          <div className={styles.valuesHead}>
            <h2 id="values-title">Values and service standards</h2>
            {valuesIntro.map((t) => (
              <p key={t.slice(0, 24)}>{t}</p>
            ))}
          </div>
          <ol className={styles.values}>
            {values.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* Outreach: showcase of two photographs */}
      <section className="band band--paper" aria-labelledby="outreach-title">
        <div className="container">
          <h2 id="outreach-title">Outreach</h2>
          <p className={styles.outreachText}>{outreach.text}</p>
          <div className={styles.outreachImages}>
            {outreach.images.map((im) => (
              <Image key={im.src} src={im.src} alt={im.alt} width={im.width} height={im.height} sizes="(max-width: 60rem) 100vw, 45vw" />
            ))}
          </div>
        </div>
      </section>

      <section className={`container ${styles.next}`} aria-label="Next steps">
        <Link className="btn btn--primary" href="/avvvs-speciality-clinic">
          See the clinics
        </Link>
        <Link className="btn" href="/consultation">
          Book a consultation
        </Link>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "@id": `${abs("/about-us")}#webpage`,
            url: abs("/about-us"),
            name: "About AVVVS",
            about: { "@id": ids.org },
            isPartOf: { "@id": ids.website },
            inLanguage: "en-IN",
          },
        ]}
      />
    </>
  );
}
