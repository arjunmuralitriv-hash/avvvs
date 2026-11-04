import Link from "next/link";
import { nav } from "@/lib/site";
import { NavMenu } from "./NavMenu";
import { CartButton } from "@/components/store/CartButton";

export function Nav() {
  return (
    <header className="nav">
      <div className="container nav__bar">
        <Link href="/" className="nav__brand" aria-label="AVVVS home">
          <span className="nav__wordmark">AVVVS</span>
          <span className="nav__sub">Since 1921 &middot; Kozhikode</span>
        </Link>
        <NavMenu items={nav.map((n) => ({ href: n.href, label: n.label }))} />
        <div className="nav__actions">
          <CartButton />
          <Link href="/consultation" className="btn btn--primary nav__book">
            Book<span className="nav__book-label-long">&nbsp;a consultation</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
