export interface Team {
  name: string;
  memberCount: number;
  members: Array<{ id: string; username: string } | string>;
  leader: string;
  createdAt?: string;
}

export interface Player {
  discordId: string;
  java: string | null;
  bedrock: string | null;
  discordUsername: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  files?: Array<{ name: string; url: string }>;
}

export interface Event {
  name: string;
  start_time: string;
  status: string;
  image_url?: string;
  user_count: number;
  location?: string;
  description?: string;
  creator: string;
}

export interface PlayerStats {
  uuid: string;
  username: string;
  stats: {
    "minecraft:custom"?: Record<string, number>;
    "minecraft:killed"?: Record<string, number>;
    "minecraft:mined"?:  Record<string, number>;
    "minecraft:crafted"?: Record<string, number>;
  };
}

export async function fetchTeams(): Promise<{ teams: Team[]; totalTeams: number; totalMembers: number }> {
  const r = await fetch("/api/teams", { next: { revalidate: 60 } });
  const d = await r.json();
  return d.success ? d : { teams: [], totalTeams: 0, totalMembers: 0 };
}

export async function fetchPlayers(): Promise<Player[]> {
  const r = await fetch("/api/player-mappings", { next: { revalidate: 60 } });
  const d = await r.json();
  return d.success ? d.mappings : [];
}

export async function fetchBlogs(): Promise<BlogPost[]> {
  const r = await fetch("/api/blog?action=get_blogs", { next: { revalidate: 60 } });
  const d = await r.json();
  return d.success ? (d.blogs as BlogPost[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
}

export async function fetchEvents(): Promise<Event[]> {
  const r = await fetch("/api/events", { next: { revalidate: 60 } });
  const d = await r.json();
  return d.success ? d.events : [];
}

export async function fetchStats(): Promise<PlayerStats[]> {
  const r = await fetch("/api/stats", { next: { revalidate: 120 } });
  const d = await r.json();
  return d.success ? d.players : [];
}

// Helpers
export function fmtTime(ticks: number): string {
  const s = Math.floor((ticks || 0) / 20);
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
export function fmtDist(cm: number): string { return ((cm || 0) / 100000).toFixed(2) + " km"; }
export function fmtNum(n: number): string   { return (n || 0).toLocaleString(); }
export function mcName(s: string): string   {
  return (s || "").replace("minecraft:", "").replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
