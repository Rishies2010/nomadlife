"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader, Empty, Card } from "@/components/ui";
import type { Event } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents]   = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events").then(r => r.json()).then(d => { setEvents(d.success ? d.events : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative py-16 px-6 overflow-hidden border-b border-[rgba(124,58,237,0.22)]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/Nomadlife_Banner.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/80 to-bg" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">Community Calendar</p>
          <h1 className="font-display font-bold text-[clamp(30px,5vw,52px)] tracking-tight text-nmtext mb-2">Events</h1>
          <p className="text-muted text-base">Upcoming server events and community activities.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? <Loader /> : !events || events.length === 0 ? (
          <Empty icon="📅" title="No Upcoming Events" sub="Check back soon - events get posted here and in Discord." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev, i) => {
              const start = new Date(ev.start_time);
              const date  = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const time  = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
              const isLive = ev.status === "active";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <Card className="p-5 h-full flex flex-col">
                    {ev.image_url && (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 flex-shrink-0">
                        <Image src={ev.image_url} alt={ev.name} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-[17px] text-nmtext leading-snug">{ev.name}</h3>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${isLive ? "bg-[rgba(52,211,153,0.12)] text-success border-[rgba(52,211,153,0.25)]" : "bg-[rgba(167,139,250,0.1)] text-violet border-[rgba(124,58,237,0.22)]"}`}>
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />}
                        {isLive ? "Live" : "Scheduled"}
                      </span>
                    </div>
                    <div className="text-[13px] text-muted space-y-1 mb-3">
                      <p>? {date} ? {time}</p>
                      {ev.location  && <p>? {ev.location}</p>}
                      {ev.user_count > 0 && <p>? {ev.user_count} interested</p>}
                    </div>
                    {ev.description && <p className="text-[13px] text-subtle leading-relaxed flex-1">{ev.description}</p>}
                    <p className="text-[11px] text-subtle mt-3">? {ev.creator}</p>
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
