"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader, Empty, StatChip, PlatformChip } from "@/components/ui";
import PlayerStatsModal from "@/components/PlayerStatsModal";
import type { Player } from "@/lib/api";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<Player | null>(null);

  useEffect(() => {
    fetch("/api/player-mappings").then(r => r.json()).then(d => { setPlayers(d.success ? d.mappings : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = (players || []).filter(p => {
    const q = search.toLowerCase();
    return (p.java || "").toLowerCase().includes(q) || (p.bedrock || "").toLowerCase().includes(q) || (p.discordUsername || "").toLowerCase().includes(q);
  });

  const getPlatform = (p: Player): "java" | "bedrock" | "both" => p.java && p.bedrock ? "both" : p.java ? "java" : "bedrock";

  return (
    <div className="min-h-screen">
      <AnimatePresence>{selected && <PlayerStatsModal player={selected} onClose={() => setSelected(null)} />}</AnimatePresence>

      {/* Page hero */}
      <div className="relative py-16 px-6 overflow-hidden border-b border-[rgba(124,58,237,0.22)]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/Nomadlife_Banner.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/80 to-bg" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">Community</p>
          <h1 className="font-display font-bold text-[clamp(30px,5vw,52px)] tracking-tight text-nmtext mb-2">Players</h1>
          <p className="text-muted text-base mb-5">Click any player to view their stats.</p>
          {players && (
            <div className="flex gap-2 flex-wrap">
              <StatChip label="Registered"  value={players.length} />
              <StatChip label="Crossplay"   value={players.filter(p => p.java && p.bedrock).length} />
              <StatChip label="Bedrock-only" value={players.filter(p => !p.java && p.bedrock).length} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <input
          className="w-full max-w-sm mb-8 px-4 py-2.5 bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-xl text-[14px] text-nmtext outline-none focus:border-purple placeholder-subtle transition-colors"
          placeholder="Search by username or Discord…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading ? <Loader /> : !players || filtered.length === 0 ? (
          <Empty icon="👤" title="No Players Found" sub={search ? "Try a different search." : "No players registered yet."} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((p, i) => {
              const display = p.java || p.bedrock || "Unknown";
              return (
                <motion.div key={p.discordId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.35 }}>
                  <div
                    onClick={() => setSelected(p)}
                    className="bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:border-[rgba(167,139,250,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(124,58,237,0.18)] group"
                  >
                    <Image
                      src={`https://mc-heads.net/avatar/${display}/52`}
                      alt={display}
                      width={52} height={52}
                      className="rounded-xl border-2 border-[rgba(124,58,237,0.22)] pixel flex-shrink-0"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-[15px] text-nmtext group-hover:text-lavender transition-colors truncate">{display}</p>
                      {p.discordUsername && <p className="text-[11px] text-subtle truncate mb-1">@{p.discordUsername}</p>}
                      <PlatformChip type={getPlatform(p)} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
