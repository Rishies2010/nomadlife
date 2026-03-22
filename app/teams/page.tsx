"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader, Empty, StatChip, Card } from "@/components/ui";
import type { Team } from "@/lib/api";

export default function TeamsPage() {
  const [data, setData]     = useState<{ teams: Team[]; totalTeams: number; totalMembers: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]  = useState("");

  useEffect(() => {
    fetch("/api/teams").then(r => r.json()).then(d => { setData(d.success ? d : null); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const teams = (data?.teams || [])
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.memberCount - a.memberCount);

  return (
    <div className="min-h-screen">
      {/* Page hero with banner bg */}
      <div className="relative py-16 px-6 overflow-hidden border-b border-[rgba(124,58,237,0.22)]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/Nomadlife_Banner.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/80 to-bg" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">Factions</p>
          <h1 className="font-display font-bold text-[clamp(30px,5vw,52px)] tracking-tight text-nmtext mb-2">Active Teams</h1>
          <p className="text-muted text-base mb-5">Form alliances, build bases, dominate the server.</p>
          {data && (
            <div className="flex gap-2 flex-wrap">
              <StatChip label="Teams"   value={data.totalTeams}   />
              <StatChip label="Members" value={data.totalMembers} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <input
          className="w-full max-w-sm mb-8 px-4 py-2.5 bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-xl text-[14px] text-nmtext outline-none focus:border-purple placeholder-subtle transition-colors"
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? <Loader /> : !data || teams.length === 0 ? (
          <Empty icon="??" title={search ? "No teams matched" : "No Teams Yet"} sub="Be the first to create a faction." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, i) => {
              const created = team.createdAt ? new Date(team.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : null;
              return (
                <motion.div key={team.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}>
                  <Card className="p-5 h-full">
                    <h3 className="font-display font-bold text-[19px] text-nmtext mb-1">{team.name}</h3>
                    <p className="text-[12px] text-subtle mb-4">{team.memberCount} member{team.memberCount !== 1 ? "s" : ""}{created ? ` ? Since ${created}` : ""}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(team.members || []).slice(0, 6).map(m => {
                        const id   = typeof m === "object" ? m.id : m;
                        const name = typeof m === "object" ? (m.username || `User_${id}`) : `User_${id}`;
                        const isLeader = String(id) === String(team.leader);
                        return (
                          <span key={String(id)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isLeader ? "bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.3)] text-warning" : "bg-[rgba(124,58,237,0.06)] border-[rgba(124,58,237,0.22)] text-muted"}`}>
                            {isLeader ? "? " : ""}{name}
                          </span>
                        );
                      })}
                      {(team.members?.length || 0) > 6 && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-[rgba(124,58,237,0.06)] border-[rgba(124,58,237,0.22)] text-subtle">
                          +{team.members.length - 6} more
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
