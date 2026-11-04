import Link from "next/link";
import { cacheLife } from "next/cache";
import { clinic, footerNav, org, social, telHref, external } from "@/lib/site";

// Cache Components: the current year must be cached, not read during prerender.
async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <address className="footer__colophon" style={{ fontStyle: "normal" }}>
          {org.name}, preparing Ayurveda medicines in Kozhikode since {org.foundingYear}. {clinic.name}, {clinic.street},{" "}
          {clinic.locality}, {clinic.city}, {clinic.region} {clinic.postalCode}, {clinic.landmark.charAt(0).toLowerCase() + clinic.landmark.slice(1)}. Write to{" "}
          <a className="link" href={`mailto:${clinic.email}`}>{clinic.email}</a> or call{" "}
          <a className="link" href={telHref(clinic.phones[0])}>{clinic.phones[0]}</a> or{" "}
          <a className="link" href={telHref(clinic.phones[1])}>{clinic.phones[1]}</a>.
        </address>
        <ul className="footer__links">
          {footerNav.map((l) => (
            <li key={l.href}><Link className="link" href={l.href}>{l.label}</Link></li>
          ))}
          <li><a className="link" href={external.gloveda} rel="noopener">Gloveda cosmetics</a></li>
        </ul>
        <div className="footer__legal">
          <span>© <Year /> {org.name}</span>
          <span>
            <a className="link" href={social.facebook} rel="noopener">Facebook</a>{", "}
            <a className="link" href={social.instagram} rel="noopener">Instagram</a>{", "}
            <a className="link" href={social.x} rel="noopener">X</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
