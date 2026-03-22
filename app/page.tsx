"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { GlowDivider, FAQ, CopyBtn, Card } from "@/components/ui";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] } }),
};

const features = [
  { icon: "\u2694", title: "Anarchy Server",          desc: "No rules. Pure survival. Build, raid, and survive in a completely open world where only the strongest thrive." },
  { icon: "\uD83C\uDFA8", title: "Creative Server",          desc: "Full WorldEdit access. Unlimited blocks. Build your dream structures without any limitations." },
  { icon: "\uD83C\uDF10", title: "Java + Bedrock Crossplay", desc: "Powered by Geyser. Java and Bedrock players share the same world with zero disruptions." },
  { icon: "\uD83D\uDEE1", title: "Faction System",           desc: "Form teams, recruit members, manage your crew from Discord, and dominate the server leaderboard." },
  { icon: "\uD83D\uDCAC", title: "Discord <-> MC Chat",        desc: "Chat with in-game players directly from Discord. Never miss a conversation even when you're offline." },
  { icon: "\u26A1", title: "Always Online",            desc: "Hosted 24/7 with 99% uptime on private infrastructure. Join whenever the mood hits." },
];

const testimonials = [
  { name: "TOXIN12",     role: "Player", quote: "A very fun survival server. Easy to setup and join. Having lots of fun." },
  { name: "tga098",      role: "Player", quote: "The creative mode is what I particularly liked. WorldEdit was a great option. Good job!" },
  { name: "scoped4life", role: "Admin",  quote: "An awesome server. Invited all my favourite friends to it. Simple and most entertaining." },
];

export default function HomePage() {
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [teamCount,   setTeamCount]   = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY     = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [0.22, 0]);

  useEffect(() => {
    fetch("/api/player-mappings").then(r => r.json()).then(d => { if (d.success) setPlayerCount(d.totalPlayers); }).catch(() => {});
    fetch("/api/teams").then(r => r.json()).then(d => { if (d.success) setTeamCount(d.totalTeams); }).catch(() => {});
  }, []);

  const stats = [
    { val: playerCount ?? "-", label: "Players"  },
    { val: teamCount   ?? "-", label: "Teams"    },
    { val: "24/7",             label: "Uptime"   },
    { val: "1.21",             label: "Version"  },
  ];

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} style={{minHeight:"92vh"}} className="relative flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Banner bg with parallax */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: bgY, opacity: bgOpacity }}
        >
          <Image
            src="/images/Nomadlife_Banner.png"
            alt=""
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg" />
        </motion.div>

        {/* Grain on top of banner */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />

        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          {/* Live badge */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[rgba(167,139,250,0.09)] border border-[rgba(124,58,237,0.25)] text-violet text-[12px] font-bold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_#34d399] animate-pulse-slow" />
            Season 3 - Now Live
          </motion.div>

          {/* NomadLife logo as the big hero element */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="mb-4">
            <Image
              src="/images/nomadlife_logo_clear.png"
              alt="NomadLife"
              width={340} height={180}
              className="drop-shadow-[0_0_40px_rgba(167,139,250,0.5)] mx-auto select-none"
              priority
              unoptimized
            />
          </motion.div>

          {/* Nexus subtitle */}
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="font-display font-bold text-[clamp(28px,5vw,52px)] tracking-[-1px] text-grad mb-5 leading-tight">
            Nexus
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="text-muted text-[17px] max-w-lg mx-auto leading-relaxed mb-10">
            Anarchy. Creative. Crossplay. 24/7. Build empires, form factions, and leave your mark on the server.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="flex gap-3 flex-wrap justify-center mb-14">
            <a href="https://dsc.gg/nomadlife" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-purple hover:bg-neon rounded-full text-white font-semibold text-[15px] transition-all duration-250 shadow-[0_0_28px_rgba(124,58,237,0.55)] hover:shadow-[0_0_44px_rgba(124,58,237,0.75)] hover:-translate-y-0.5">
              Join the Server
            </a>
            <Link href="/players"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-[rgba(167,139,250,0.2)] text-nmtext font-semibold text-[15px] transition-all duration-250 hover:bg-[rgba(167,139,250,0.07)] hover:border-violet hover:-translate-y-0.5">
              View Players
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="grid grid-cols-4 divide-x divide-[rgba(124,58,237,0.22)] border border-[rgba(124,58,237,0.22)] rounded-2xl overflow-hidden max-w-lg w-full">
            {stats.map(s => (
              <div key={s.label} className="bg-bg1/90 backdrop-blur-sm py-5 px-2 text-center">
                <div className="font-display font-bold text-2xl text-lavender">{s.val}</div>
                <div className="text-[11px] text-subtle uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent z-10" />
      </section>

      <GlowDivider />

      {/* FEATURES */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <SectionEntrance>
          <div className="mb-11">
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">What We Offer</p>
            <h2 className="font-display font-bold text-[clamp(26px,4vw,42px)] tracking-tight text-nmtext">Built Different</h2>
            <p className="text-muted mt-2 text-base max-w-md">Everything you need for a premium Minecraft experience.</p>
          </div>
        </SectionEntrance>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <SectionEntrance key={f.title} delay={i * 0.07}>
              <Card className="p-6 h-full">
                <div className="w-11 h-11 rounded-xl bg-[rgba(167,139,250,0.08)] border border-[rgba(124,58,237,0.22)] flex items-center justify-center text-xl mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-[16px] text-nmtext mb-2">{f.title}</h3>
                <p className="text-[14px] text-muted leading-relaxed">{f.desc}</p>
              </Card>
            </SectionEntrance>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <SectionEntrance>
          <div className="mb-11">
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">From Players</p>
            <h2 className="font-display font-bold text-[clamp(26px,4vw,42px)] tracking-tight text-nmtext">What They Say</h2>
          </div>
        </SectionEntrance>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <SectionEntrance key={t.name} delay={i * 0.1}>
              <Card className="p-6 h-full flex flex-col">
                <p className="text-[14px] text-muted leading-[1.75] italic flex-1 relative pl-4 before:content-['"'] before:absolute before:left-0 before:-top-1 before:text-2xl before:text-violet before:not-italic">{t.quote}</p>
                <div className="flex items-center gap-3 mt-5">
                  <Image src={`https://mc-heads.net/avatar/${t.name}/36`} alt={t.name} width={36} height={36} className="rounded-lg border-2 border-[rgba(124,58,237,0.22)] pixel" unoptimized />
                  <div>
                    <p className="font-display font-semibold text-[14px] text-nmtext">{t.name}</p>
                    <p className="text-[11px] text-subtle">{t.role}</p>
                  </div>
                </div>
              </Card>
            </SectionEntrance>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* JOIN + DISCORD */}
      <section className="bg-bg1 border-y border-[rgba(124,58,237,0.22)] py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <SectionEntrance>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-3">Get Started</p>
            <h2 className="font-display font-bold text-[clamp(26px,4vw,38px)] tracking-tight text-nmtext mb-4 leading-tight">
              Join the Nexus <span className="text-violet">Today</span>
            </h2>
            <p className="text-muted text-[15px] leading-relaxed mb-7">
              Link your Minecraft account on Discord, grab the server IP, and start playing. Takes less than a minute.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-subtle mb-1.5">Java IP</p>
                <div className="flex max-w-[340px] bg-bg2 border border-[rgba(124,58,237,0.22)] rounded-xl overflow-hidden">
                  <span className="flex-1 px-4 py-2.5 font-display text-[14px] text-lavender font-semibold">nomadlife.qzz.io</span>
                  <CopyBtn text="nomadlife.qzz.io" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-subtle mb-1.5">Discord</p>
                <div className="flex max-w-[340px] bg-bg2 border border-[rgba(124,58,237,0.22)] rounded-xl overflow-hidden">
                  <span className="flex-1 px-4 py-2.5 font-display text-[14px] text-lavender font-semibold">dsc.gg/nomadlife</span>
                  <CopyBtn text="https://dsc.gg/nomadlife" />
                </div>
              </div>
            </div>
          </SectionEntrance>
          <SectionEntrance delay={0.15}>
            <div className="rounded-2xl overflow-hidden border border-[rgba(124,58,237,0.22)] shadow-[0_8px_48px_rgba(124,58,237,0.2)]">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-bg2 border-b border-[rgba(124,58,237,0.22)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5865f2]" />
                <span className="font-display font-semibold text-[14px] text-nmtext">NomadLife Nexus</span>
              </div>
              <iframe
                src="https://discord.com/widget?id=1450826853999841323&theme=dark"
                width="100%" height="300"
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              />
            </div>
          </SectionEntrance>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <SectionEntrance>
          <div className="mb-11">
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">FAQ</p>
            <h2 className="font-display font-bold text-[clamp(26px,4vw,42px)] tracking-tight text-nmtext">Common Questions</h2>
          </div>
        </SectionEntrance>
        <div className="max-w-2xl">
          <FAQ />
        </div>
      </section>
    </>
  );
}

// Scroll reveal wrapper
function SectionEntrance({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
