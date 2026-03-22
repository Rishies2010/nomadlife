"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const links = [
  { label: "Home",    href: "/" },
  { label: "Teams",   href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Blog",    href: "/blog" },
  { label: "Events",  href: "/events" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[200] h-16 flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${scrolled ? "bg-bg/90 backdrop-blur-2xl border-b border-[rgba(124,58,237,0.22)] shadow-lg shadow-purple/5" : "bg-transparent"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/images/nomadlife_logo_clear.png"
            alt="NomadLife"
            width={38} height={38}
            className="drop-shadow-[0_0_10px_rgba(167,139,250,0.6)] group-hover:drop-shadow-[0_0_16px_rgba(167,139,250,0.9)] transition-all duration-300"
            onError={(e: any) => { e.target.src = "/images/nmd_logo.png"; }}
          />
          <span className="font-display font-bold text-[17px] text-nmtext tracking-tight">
            Nomad<span className="text-violet">Life</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${path === l.href ? "text-lavender bg-[rgba(167,139,250,0.09)]" : "text-muted hover:text-nmtext hover:bg-[rgba(167,139,250,0.07)]"}`}
              >{l.label}</Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="https://dsc.gg/nomadlife"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 px-5 py-2 bg-purple hover:bg-neon rounded-full text-white text-[13px] font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.45)] hover:shadow-[0_0_32px_rgba(124,58,237,0.65)] hover:-translate-y-0.5"
        >
          <span>+</span> Join Discord
        </a>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-muted rounded transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-muted rounded transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-muted rounded transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="fixed top-16 left-0 right-0 z-[199] bg-bg/97 backdrop-blur-2xl border-b border-[rgba(124,58,237,0.22)] p-3 flex flex-col gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`text-center py-3 rounded-lg text-[15px] font-medium transition-all ${path === l.href ? "text-lavender bg-[rgba(167,139,250,0.09)]" : "text-muted hover:text-nmtext"}`}
            >{l.label}</Link>
          ))}
          <a href="https://dsc.gg/nomadlife" target="_blank" rel="noopener noreferrer"
            className="mt-2 text-center py-3 bg-purple rounded-full text-white font-semibold text-[14px]"
          >Join Discord</a>
        </div>
      )}
    </>
  );
}
