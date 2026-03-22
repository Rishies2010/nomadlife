"use client";
import { useState } from "react";

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-subtle">
      <div className="w-10 h-10 rounded-full border-2 border-[rgba(124,58,237,0.2)] border-t-purple animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

export function Empty({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="text-center py-16 text-subtle">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-display font-semibold text-lg text-muted mb-2">{title}</h3>
      <p className="text-sm">{sub}</p>
    </div>
  );
}

export function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); })}
      className="px-4 py-2.5 text-xs font-bold text-muted bg-[rgba(167,139,250,0.08)] border-l border-[rgba(124,58,237,0.22)] hover:bg-purple hover:text-white transition-all duration-200"
    >{copied ? "Copied!" : label}</button>
  );
}

export function GlowDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30 my-0" />;
}

export function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-11">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">{eyebrow}</p>
      <h2 className="font-display font-bold text-[clamp(26px,4vw,42px)] tracking-tight text-nmtext">{title}</h2>
      {sub && <p className="text-muted mt-2 text-base max-w-md">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-2xl card-glow transition-all duration-250 hover:border-[rgba(167,139,250,0.25)] hover:-translate-y-1 hover:shadow-[0_4px_32px_rgba(124,58,237,0.18)] ${className}`}>
      {children}
    </div>
  );
}

export function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(167,139,250,0.08)] border border-[rgba(124,58,237,0.22)] rounded-full text-xs text-muted">
      <strong className="font-display text-lavender">{value}</strong> {label}
    </span>
  );
}

export function PlatformChip({ type }: { type: "java" | "bedrock" | "both" }) {
  const styles = {
    java:    "bg-[rgba(52,211,153,0.1)] text-success border-[rgba(52,211,153,0.22)]",
    bedrock: "bg-[rgba(167,139,250,0.1)] text-violet border-[rgba(167,139,250,0.22)]",
    both:    "bg-[rgba(232,121,249,0.1)] text-pink border-[rgba(232,121,249,0.22)]",
  };
  const labels = { java: "Java", bedrock: "Bedrock", both: "Java + Bedrock" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "Can I play on both Java and Bedrock?", a: "Yes! We use Geyser so both Java and Bedrock/PE players play together on the same server with no disruptions." },
    { q: "How do I get whitelisted?", a: "Join our Discord at dsc.gg/nomadlife, go to #verify, and link your Minecraft account with one click. The bot handles whitelisting automatically." },
    { q: "What version is supported?", a: "We run 1.21.11 and support all Java clients from 1.12+, plus all Bedrock versions through Geyser." },
    { q: "What modes are available?", a: "An Anarchy server and a Creative server, both running 24/7. Season 3 is currently active." },
    { q: "Is cheating allowed?", a: "Absolutely not. Anti-Xray and anti-cheat plugins are running. Cheaters get banned automatically." },
    { q: "How do I join a team?", a: "Head to #team-create in Discord after linking. Team leaders approve join requests through the bot." },
  ];
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={i} className="bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-2xl overflow-hidden">
          <button className="w-full px-5 py-4 font-display font-semibold text-sm text-nmtext flex justify-between items-center gap-3 text-left hover:text-lavender transition-colors"
            onClick={() => setOpen(open === i ? null : i)}>
            {it.q}
            <span className={`text-subtle text-xs flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180 text-violet" : ""}`}>v</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-40 pb-4" : "max-h-0"}`}>
            <p className="px-5 text-sm text-muted leading-relaxed">{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
