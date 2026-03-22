"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader } from "@/components/ui";
import type { BlogPost } from "@/lib/api";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost]       = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch("/api/blog?action=get_blogs")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.blogs) {
          const found = d.blogs.find((b: BlogPost) => b.id === id);
          if (found) { setPost(found); if (typeof document !== "undefined") document.title = `${found.title} - NomadLife Nexus`; }
          else setError(true);
        } else setError(true);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[13px] text-subtle hover:text-violet transition-colors mb-8">
          Back to Blog
        </Link>

        {loading ? <Loader /> : error ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">?</div>
            <h2 className="font-display font-bold text-xl text-muted mb-2">Post not found</h2>
            <p className="text-subtle text-sm mb-6">This blog post doesn't exist or was removed.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple rounded-full text-white font-semibold text-sm">Back to Blog</Link>
          </div>
        ) : post && (
          <article>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet mb-3">
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="font-display font-bold text-[clamp(26px,4vw,44px)] tracking-tight text-nmtext mb-10 leading-tight">{post.title}</h1>
            <div
              className="text-[16px] text-muted leading-[1.85] prose-invert"
              dangerouslySetInnerHTML={{ __html: (post.content || "").replace(/\n/g, "<br />") }}
            />
            {post.files && post.files.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[rgba(124,58,237,0.22)]">
                <h4 className="font-display font-semibold text-[16px] text-nmtext mb-4">Attached Files</h4>
                <div className="flex flex-col gap-2">
                  {post.files.map(f => (
                    <a key={f.name} href={f.url} download={f.name}
                      className="flex items-center justify-between px-4 py-3 bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-xl hover:border-violet hover:bg-[rgba(167,139,250,0.07)] transition-all duration-200 group">
                      <span className="flex items-center gap-2 text-[14px] text-nmtext">
                        <span className="text-muted">?</span> {f.name}
                      </span>
                      <span className="text-[12px] text-violet font-semibold group-hover:text-lavender">Download ?</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}
