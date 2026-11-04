"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavMenu({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        className="btn nav__menu-btn"
        aria-expanded={open}
        aria-controls="site-links"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <ul id="site-links" className="nav__links" data-open={open}>
        {items.map((it) => {
          const current = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <li key={it.href}>
              <Link href={it.href} className="link" aria-current={current ? "page" : undefined}>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
