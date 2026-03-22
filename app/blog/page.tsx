"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader, Empty, Card } from "@/components/ui";
import type { BlogPost } from "@/lib/api";

export default function BlogPage() {
  const [blogs, setBlogs]     = useState<BlogPost[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog?action=get_blogs")
      .then(r => r.json())
      .then(d => {
        const sorted = (d.blogs || []).sort((a: BlogPost, b: BlogPost) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBlogs(d.success ? sorted : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative py-16 px-6 overflow-hidden border-b border-[rgba(124,58,237,0.22)]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/Nomadlife_Banner.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/80 to-bg" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-violet mb-2">Updates</p>
          <h1 className="font-display font-bold text-[clamp(30px,5vw,52px)] tracking-tight text-nmtext mb-2">The Blog</h1>
          <p className="text-muted text-base">Server news, events, and announcements from the team.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? <Loader /> : !blogs || blogs.length === 0 ? (
          <Empty icon="📝" title="No Posts Yet" sub="Check back soon for updates." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b, i) => {
              const date = new Date(b.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
              const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");
                  const rawExcerpt = b.excerpt || (b.content || "").substring(0, 180);
                  const excerpt = stripHtml(rawExcerpt).substring(0, 140) + (rawExcerpt.length > 140 ? "..." : "");
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <Card className="p-6 h-full flex flex-col">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-violet mb-2">{date}</p>
                    <h3 className="font-display font-bold text-[18px] text-nmtext leading-snug mb-2" dangerouslySetInnerHTML={{ __html: b.title }} />
                    <p className="text-[14px] text-muted leading-relaxed flex-1 mb-5">{excerpt}</p>
                    <Link
                      href={`/blog/${b.id}`}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-purple hover:bg-neon rounded-full text-white font-semibold text-sm transition-all duration-200  hover: hover:-translate-y-0.5 self-start"
                    >Read More</Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="mt-10 text-right">
          <a href="/admin" className="text-[12px] text-subtle hover:text-violet transition-colors">Admin Panel ↗</a>
        </div>
      </div>
    </div>
  );
}
