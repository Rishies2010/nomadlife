"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader } from "./ui";
import type { Player, PlayerStats } from "@/lib/api";
import { fmtTime, fmtDist, fmtNum, mcName } from "@/lib/api";

interface Props { player: Player; onClose: () => void; }

export default function PlayerStatsModal({ player, onClose }: Props) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const displayName = player.java || player.bedrock || "Unknown";

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.players) {
          const found = d.players.find((p: PlayerStats) => p.username.toLowerCase() === displayName.toLowerCase());
          setStats(found || { uuid: "", username: displayName, stats: {} });
        } else setStats({ uuid: "", username: displayName, stats: {} });
        setLoading(false);
      })
      .catch(() => { setStats({ uuid: "", username: displayName, stats: {} }); setLoading(false); });
  }, [player, displayName]);

  const custom   = stats?.stats?.["minecraft:custom"]  || {};
  const killed   = stats?.stats?.["minecraft:killed"]  || {};
  const mined    = stats?.stats?.["minecraft:mined"]   || {};
  const crafted  = stats?.stats?.["minecraft:crafted"] || {};
  const topKilled  = Object.entries(killed).sort((a,b) => b[1]-a[1]).slice(0,6);
  const topMined   = Object.entries(mined).sort((a,b) => b[1]-a[1]).slice(0,6);
  const topCrafted = Object.entries(crafted).sort((a,b) => b[1]-a[1]).slice(0,5);
  const hasStats = Object.keys(custom).length > 0;

  return (
    <div
      className="fixed inset-0 z-[500] bg-bg/88 backdrop-blur-xl flex items-start justify-center p-4 pt-20 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg1 border border-[rgba(167,139,250,0.2)] rounded-2xl w-full max-w-3xl shadow-[0_8px_48px_rgba(124,58,237,0.3)] relative">
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-[rgba(124,58,237,0.22)]">
          <Image
            src={`https://mc-heads.net/avatar/${displayName}/72`}
            alt={displayName}
            width={72} height={72}
            className="rounded-xl border-2 border-purple pixel"
            unoptimized
          />
          <div>
            <h2 className="font-display font-bold text-2xl text-nmtext mb-1">{displayName}</h2>
            <p className="text-sm text-subtle">
              {player.java && player.bedrock ? "Java + Bedrock" : player.java ? "Java" : "Bedrock"}
              {player.discordUsername ? ` - @${player.discordUsername}` : ""}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {player.java    && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-[rgba(52,211,153,0.1)] text-success border-[rgba(52,211,153,0.22)]">Java</span>}
              {player.bedrock && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-[rgba(167,139,250,0.1)] text-violet border-[rgba(167,139,250,0.22)]">Bedrock</span>}
            </div>
          </div>
        </div>
        <button onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[rgba(167,139,250,0.08)] border border-[rgba(124,58,237,0.22)] text-muted hover:bg-purple hover:text-white transition-all flex items-center justify-center text-sm">
          ?
        </button>

        {/* Body */}
        <div className="p-6">
          {loading ? <Loader /> : !hasStats ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">?</div>
              <p className="font-display font-semibold text-muted">No stats recorded yet</p>
              <p className="text-sm text-subtle mt-1">Stats appear after the player has played on the server.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <StatBlock title="?? General" rows={[
                ["Play Time",    fmtTime(custom["minecraft:play_time"] || 0)],
                ["Deaths",       fmtNum(custom["minecraft:deaths"] || 0)],
                ["Mob Kills",    fmtNum(custom["minecraft:mob_kills"] || 0)],
                ["Player Kills", fmtNum(custom["minecraft:player_kills"] || 0)],
                ["Dmg Dealt",    fmtNum(custom["minecraft:damage_dealt"] || 0)],
                ["Dmg Taken",    fmtNum(custom["minecraft:damage_taken"] || 0)],
              ]} />
              <StatBlock title="? Travel" rows={[
                ["Walked",   fmtDist(custom["minecraft:walk_one_cm"] || 0)],
                ["Sprinted", fmtDist(custom["minecraft:sprint_one_cm"] || 0)],
                ["Flown",    fmtDist(custom["minecraft:fly_one_cm"] || 0)],
                ["Swum",     fmtDist(custom["minecraft:swim_one_cm"] || 0)],
                ["Jumps",    fmtNum(custom["minecraft:jump"] || 0)],
                ["Fallen",   fmtDist(custom["minecraft:fall_one_cm"] || 0)],
              ]} />
              {topMined.length > 0 && <StatBlock title="?? Top Mined" rows={topMined.map(([k,v]) => [mcName(k), fmtNum(v)])} />}
              {topKilled.length > 0 && <StatBlock title="? Top Kills" rows={topKilled.map(([k,v]) => [mcName(k), fmtNum(v)])} />}
              {topCrafted.length > 0 && <StatBlock title="? Top Crafted" rows={topCrafted.map(([k,v]) => [mcName(k), fmtNum(v)])} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="bg-bg2 border border-[rgba(124,58,237,0.18)] rounded-xl p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-violet mb-3">{title}</p>
      {rows.map(([l, v]) => (
        <div key={l} className="flex justify-between items-center py-1.5 border-b border-[rgba(124,58,237,0.08)] last:border-0">
          <span className="text-[13px] text-muted">{l}</span>
          <span className="text-[13px] font-semibold text-nmtext font-display">{v}</span>
        </div>
      ))}
    </div>
  );
}
