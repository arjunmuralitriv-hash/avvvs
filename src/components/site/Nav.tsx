import Image from "next/image";
import Link from "next/link";
import { nav } from "@/lib/site";
import { NavMenu } from "./NavMenu";
import { CartButton } from "@/components/store/CartButton";

export function Nav() {
  return (
    <header className="nav">
      <div className="container nav__bar">
        <Link href="/" className="nav__brand" aria-label="AVVVS home">
          <Image src="/brand/avvvs-logo.png" alt="AVVVS, Arya Vaidya Vilasini Vaidyasala, since 1921" width={612} height={308} priority sizes="104px" />
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
