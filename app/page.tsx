"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowDivider, FAQ, CopyBtn, Card } from "@/components/ui";

const features = [
  { icon: "⚔️", title: "Anarchy Server", desc: "No rules. Pure survival. Build, raid, and survive in a completely open world where only the strongest thrive." },
  { icon: "🎨", title: "Creative Server", desc: "Full WorldEdit access. Unlimited blocks. Build your dream structures without any limitations." },
  { icon: "🌐", title: "Java + Bedrock Crossplay", desc: "Powered by Geyser. Java and Bedrock players share the same world with zero disruptions." },
  { icon: "🛡️", title: "Faction System", desc: "Form teams, recruit members, manage your crew from Discord, and dominate the server leaderboard." },
  { icon: "💬", title: "Discord + MC Chat", desc: "Chat with in-game players directly from Discord. Never miss a conversation even when offline." },
  { icon: "⚡", title: "Always Online", desc: "Hosted 24/7 with 99% uptime on private infrastructure. Join whenever the mood hits." },
];

const testimonials = [
  { name: "TOXIN12",     role: "Player", quote: "A very fun survival server. Easy to setup and join. Having lots of fun." },
  { name: "tga098",      role: "Player", quote: "The creative mode is what I particularly liked. WorldEdit was a great option. Good job!" },
  { name: "scoped4life", role: "Admin",  quote: "An awesome server. Invited all my favourite friends to it. Simple and most entertaining." },
];

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [playerCount, setPlayerCount] = useState<number | string>("-");
  const [teamCount, setTeamCount] = useState<number | string>("-");

  useEffect(() => {
    fetch("/api/player-mappings").then(r => r.json()).then(d => { if (d.success) setPlayerCount(d.totalPlayers); }).catch(() => {});
    fetch("/api/teams").then(r => r.json()).then(d => { if (d.success) setTeamCount(d.totalTeams); }).catch(() => {});
  }, []);

  const stats = [
    { val: playerCount, label: "Players"  },
    { val: teamCount,   label: "Teams"    },
    { val: "24/7",      label: "Uptime"   },
    { val: "1.21.11",      label: "Version"  },
  ];

  return (
    <div>

      <section className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden" style={{ minHeight: "92vh" }}>
        <div className="absolute inset-0 z-0">
          <Image src="/images/Nomadlife_Banner.png" alt="" fill className="object-cover" priority unoptimized />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg" />
        </div>

        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        <div className="relative z-10 max-w-3xl flex flex-col items-center">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet/10 border border-purple/30 text-violet text-xs font-bold uppercase tracking-widest mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" style={{ boxShadow: "0 0 8px #34d399" }} />
            Season 4 · Now Live
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mb-4"
          >
            <Image
              src="/images/nomadlife_logo_clear.png"
              alt="NomadLife"
              width={320}
              height={170}
              className="mx-auto select-none"
              style={{ filter: "drop-shadow(0 0 40px rgba(167,139,250,0.5))" }}
              priority
              unoptimized
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="font-display font-bold tracking-tight text-grad mb-5 leading-tight"
            style={{ fontSize: "clamp(28px, 5vw, 52px)" }}
          >
            Nexus
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="text-muted text-lg max-w-lg mx-auto leading-relaxed mb-10"
          >
            Anarchy. Creative. Crossplay. 24/7. Build empires, form factions, and leave your mark on the server.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="flex gap-3 flex-wrap justify-center mb-14"
          >
            <a
              href="https://dsc.gg/nomadlife"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 bg-purple hover:bg-neon rounded-full text-white font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
              style={{ boxShadow: "0 0 28px rgba(124,58,237,0.55)" }}
            >
              Join the Server
            </a>
            <Link
              href="/players"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border text-nmtext font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet/10"
              style={{ borderColor: "rgba(167,139,250,0.2)" }}
            >
              View Players
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.5 }}
            className="grid grid-cols-4 max-w-lg w-full overflow-hidden rounded-2xl"
            style={{ border: "1px solid rgba(124,58,237,0.22)", background: "rgba(124,58,237,0.06)" }}
          >
            {stats.map(s => (
              <div key={s.label} className="py-5 px-2 text-center" style={{ borderRight: "1px solid rgba(124,58,237,0.15)" }}>
                <div className="font-display font-bold text-2xl text-lavender">{s.val}</div>
                <div className="text-subtle uppercase tracking-wider mt-1" style={{ fontSize: 11 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent z-10" />
      </section>

      <GlowDivider />

      <section className="py-20 px-6 max-w-6xl mx-auto">
        <Reveal>
          <div className="mb-11">
            <p className="text-xs font-bold uppercase tracking-widest text-violet mb-2">What We Offer</p>
            <h2 className="font-display font-bold tracking-tight text-nmtext" style={{ fontSize: "clamp(26px,4vw,42px)" }}>Built Different</h2>
            <p className="text-muted mt-2 text-base max-w-md">Everything you need for a premium Minecraft experience.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <Card className="p-6 h-full">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(124,58,237,0.22)" }}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-base text-nmtext mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      <section className="py-20 px-6 max-w-6xl mx-auto">
        <Reveal>
          <div className="mb-11">
            <p className="text-xs font-bold uppercase tracking-widest text-violet mb-2">From Players</p>
            <h2 className="font-display font-bold tracking-tight text-nmtext" style={{ fontSize: "clamp(26px,4vw,42px)" }}>What They Say</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <Card className="p-6 h-full flex flex-col">
                <p className="text-sm text-muted leading-relaxed italic flex-1 mb-5 pl-4 relative before:content-[open-quote] before:absolute before:left-0 before:-top-1 before:text-2xl before:text-violet before:not-italic before:leading-none">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <Image src={`https://mc-heads.net/avatar/${t.name}/36`} alt={t.name} width={36} height={36} className="rounded-lg pixel" style={{ border: "2px solid rgba(124,58,237,0.3)" }} unoptimized />
                  <div>
                    <p className="font-display font-semibold text-sm text-nmtext">{t.name}</p>
                    <p className="text-xs text-subtle">{t.role}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      <section className="py-20 px-6" style={{ background: "#0d0d1f", borderTop: "1px solid rgba(124,58,237,0.22)", borderBottom: "1px solid rgba(124,58,237,0.22)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-widest text-violet mb-3">Get Started</p>
            <h2 className="font-display font-bold tracking-tight text-nmtext mb-4 leading-tight" style={{ fontSize: "clamp(26px,4vw,38px)" }}>
              Join the Nexus <span className="text-violet">Today</span>
            </h2>
            <p className="text-muted text-base leading-relaxed mb-7">
              Join our Discord, link your Minecraft account in 🔐・verify, and you will get the server IP. Takes less than a minute.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-subtle uppercase tracking-wider mb-1.5" style={{ fontSize: 10, fontWeight: 700 }}>Discord Invite</p>
                <div className="flex max-w-xs overflow-hidden rounded-xl" style={{ background: "#12122a", border: "1px solid rgba(124,58,237,0.22)" }}>
                  <span className="flex-1 px-4 py-2.5 font-display text-sm text-lavender font-semibold">dsc.gg/nomadlife</span>
                  <CopyBtn text="https://dsc.gg/nomadlife" />
                </div>
              </div>
              <p className="text-xs text-subtle mt-1">Join Discord to get the server IP and get whitelisted.</p>
              <div className="mt-4">
                <p className="text-subtle uppercase tracking-wider mb-1.5" style={{ fontSize: 10, fontWeight: 700 }}>Support</p>
                <a href="mailto:mc@nomadlife.qzz.io" className="font-display text-sm text-violet hover:text-lavender transition-colors font-semibold">mc@nomadlife.qzz.io</a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.22)", boxShadow: "0 8px 48px rgba(124,58,237,0.2)", background: "#0f0f14" }}>
              {/* Custom header replaces Discord's ugly one */}
              <div className="flex items-center gap-3 px-4" style={{ height: 64, background: "url('/images/Nomadlife_Banner.png') center/cover no-repeat", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
                <span className="relative text-2xl">🎮</span>
                <div className="relative">
                  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>NomadLife Nexus</div>
                  <div style={{ fontWeight: 300, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>The Minecraft Nexus</div>
                </div>
              </div>
              {/* Mask that crops Discord's own header out */}
              <div style={{ height: 256, overflow: "hidden", position: "relative" }}>
                <iframe
                  src="https://discord.com/widget?id=1450826853999841323&theme=dark"
                  style={{ width: "100%", height: 335, border: "none", position: "absolute", top: -80, left: 0 }}
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 px-6 max-w-6xl mx-auto">
        <Reveal>
          <div className="mb-11">
            <p className="text-xs font-bold uppercase tracking-widest text-violet mb-2">FAQ</p>
            <h2 className="font-display font-bold tracking-tight text-nmtext" style={{ fontSize: "clamp(26px,4vw,42px)" }}>Common Questions</h2>
          </div>
        </Reveal>
        <div className="max-w-2xl">
          <FAQ />
        </div>
      </section>

    </div>
  );
}
