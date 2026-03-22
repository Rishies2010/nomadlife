"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  files?: { url: string; name: string }[];
}

interface FileEntry {
  url: string;
  name: string;
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-subtle">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2.5 bg-bg2 border border-[rgba(124,58,237,0.25)] rounded-xl text-nmtext text-sm outline-none focus:border-purple transition-colors placeholder:text-subtle"
      />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-subtle">{label}</label>
      <textarea
        {...props}
        className="w-full px-4 py-2.5 bg-bg2 border border-[rgba(124,58,237,0.25)] rounded-xl text-nmtext text-sm outline-none focus:border-purple transition-colors placeholder:text-subtle resize-none"
      />
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState<"create" | "manage">("create");

  const [blogs, setBlogs]         = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);

  const [title,   setTitle]   = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [files,   setFiles]   = useState<FileEntry[]>([{ url: "", name: "" }]);
  const [formErr, setFormErr] = useState("");
  const [formOk,  setFormOk]  = useState("");

  const [changePw, setChangePw]   = useState(false);
  const [curPw,    setCurPw]      = useState("");
  const [newPw,    setNewPw]      = useState("");
  const [confPw,   setConfPw]     = useState("");
  const [pwErr,    setPwErr]      = useState("");
  const [pwOk,     setPwOk]       = useState("");

  async function login() {
    if (!password) { setLoginErr("Password is required"); return; }
    setLoading(true); setLoginErr("");
    try {
      const r = await fetch("/api/blog?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (!d.success) { setLoginErr(d.message || "Invalid password"); return; }
      const tr = await fetch("/api/get-token");
      const td = await tr.json();
      if (!td.success) { setLoginErr("Auth error: " + (td.message || "Could not get token")); return; }
      setAuthToken(td.token);
      setAuthed(true);
      loadBlogs();
    } catch {
      setLoginErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBlogs() {
    setBlogsLoading(true);
    try {
      const r = await fetch("/api/blog?action=get_blogs");
      const d = await r.json();
      setBlogs(d.success ? d.blogs.sort((a: BlogPost, b: BlogPost) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []);
    } catch {
      setBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      const r = await fetch("/api/blog?action=delete_blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId: id, authToken }),
      });
      const d = await r.json();
      if (d.success) setBlogs(b => b.filter(p => p.id !== id));
      else alert("Error: " + (d.message || "Unknown error"));
    } catch {
      alert("Network error.");
    }
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(""); setFormOk("");
    if (!title.trim()) { setFormErr("Title is required"); return; }
    if (!content.trim()) { setFormErr("Content is required"); return; }
    setLoading(true);
    try {
      const validFiles = files.filter(f => f.url.trim() && f.name.trim());
      const r = await fetch("/api/blog?action=create_blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), excerpt: excerpt.trim(), content: content.trim(), files: validFiles, authToken }),
      });
      const d = await r.json();
      if (d.success) {
        setFormOk("Post published successfully!");
        setTitle(""); setExcerpt(""); setContent(""); setFiles([{ url: "", name: "" }]);
        loadBlogs();
        setTimeout(() => { setTab("manage"); setFormOk(""); }, 1200);
      } else {
        setFormErr(d.message || "Error creating post");
      }
    } catch {
      setFormErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(""); setPwOk("");
    if (!curPw || !newPw || !confPw) { setPwErr("All fields are required"); return; }
    if (newPw !== confPw) { setPwErr("New passwords do not match"); return; }
    if (newPw.length < 6) { setPwErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/blog?action=change_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: curPw, newPassword: newPw, authToken }),
      });
      const d = await r.json();
      if (d.success) {
        setPwOk("Password changed successfully!");
        setCurPw(""); setNewPw(""); setConfPw("");
        setTimeout(() => { setChangePw(false); setPwOk(""); }, 1500);
      } else {
        setPwErr(d.message || "Error changing password");
      }
    } catch {
      setPwErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  function addFile() { setFiles(f => [...f, { url: "", name: "" }]); }
  function removeFile(i: number) { setFiles(f => f.filter((_, idx) => idx !== i)); }
  function updateFile(i: number, field: "url" | "name", val: string) {
    setFiles(f => f.map((entry, idx) => idx === i ? { ...entry, [field]: val } : entry));
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-bg1 border border-[rgba(124,58,237,0.25)] rounded-2xl p-8" style={{ boxShadow: "0 8px 48px rgba(124,58,237,0.2)" }}>
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-2xl text-nmtext mb-1">Admin Panel</h1>
              <p className="text-sm text-subtle">NomadLife Nexus</p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                autoFocus
              />
              {loginErr && <p className="text-xs text-red-400 font-medium">{loginErr}</p>}
              <button
                onClick={login}
                disabled={loading}
                className="w-full py-3 bg-purple hover:bg-neon rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                style={{ boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <Link href="/" className="text-center text-xs text-subtle hover:text-violet transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">

      {/* Change password modal */}
      {changePw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-md px-4">
          <div className="bg-bg1 border border-[rgba(124,58,237,0.25)] rounded-2xl p-6 w-full max-w-md" style={{ boxShadow: "0 8px 48px rgba(124,58,237,0.25)" }}>
            <h3 className="font-display font-bold text-lg text-nmtext mb-5">Change Password</h3>
            <form onSubmit={changePassword} className="flex flex-col gap-4">
              <Input label="Current Password" type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="Current password" />
              <Input label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min 6 chars)" />
              <Input label="Confirm New Password" type="password" value={confPw} onChange={e => setConfPw(e.target.value)} placeholder="Confirm new password" />
              {pwErr && <p className="text-xs text-red-400">{pwErr}</p>}
              {pwOk  && <p className="text-xs text-success">{pwOk}</p>}
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setChangePw(false); setPwErr(""); setPwOk(""); }} className="flex-1 py-2.5 rounded-xl border border-[rgba(124,58,237,0.25)] text-muted text-sm hover:bg-bg2 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-purple hover:bg-neon text-white font-semibold text-sm transition-all disabled:opacity-50">
                  {loading ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-nmtext">Dashboard</h1>
          <p className="text-sm text-subtle mt-0.5">NomadLife Nexus Admin</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setChangePw(true)} className="px-4 py-2 rounded-xl border border-[rgba(251,191,36,0.3)] text-warning text-sm font-semibold hover:bg-[rgba(251,191,36,0.1)] transition-colors">
            Change Password
          </button>
          <button onClick={() => { setAuthed(false); setAuthToken(""); setPassword(""); }} className="px-4 py-2 rounded-xl border border-[rgba(248,113,113,0.3)] text-red-400 text-sm font-semibold hover:bg-[rgba(248,113,113,0.1)] transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg2 rounded-xl p-1 w-fit">
        {(["create", "manage"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? "bg-purple text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]" : "text-muted hover:text-nmtext"}`}>
            {t === "create" ? "Create Post" : "Manage Posts"}
          </button>
        ))}
      </div>

      {/* Create tab */}
      {tab === "create" && (
        <div className="bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-2xl p-6">
          <form onSubmit={createPost} className="flex flex-col gap-5">
            <Input label="Title" placeholder="Post title" value={title} onChange={e => setTitle(e.target.value)} required />
            <Input label="Excerpt (optional)" placeholder="Short summary shown on the blog listing" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
            <Textarea label="Content" placeholder="Write your post content here..." value={content} onChange={e => setContent(e.target.value)} rows={12} required />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle mb-3">Attached Files (optional)</p>
              <div className="flex flex-col gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="flex-1 px-3 py-2 bg-bg2 border border-[rgba(124,58,237,0.25)] rounded-lg text-nmtext text-sm outline-none focus:border-purple transition-colors placeholder:text-subtle"
                      placeholder="File URL"
                      value={f.url}
                      onChange={e => updateFile(i, "url", e.target.value)}
                    />
                    <input
                      className="flex-1 px-3 py-2 bg-bg2 border border-[rgba(124,58,237,0.25)] rounded-lg text-nmtext text-sm outline-none focus:border-purple transition-colors placeholder:text-subtle"
                      placeholder="Display name"
                      value={f.name}
                      onChange={e => updateFile(i, "name", e.target.value)}
                    />
                    {files.length > 1 && (
                      <button type="button" onClick={() => removeFile(i)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-[rgba(248,113,113,0.3)] text-red-400 hover:bg-[rgba(248,113,113,0.1)] transition-colors text-sm">
                        x
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addFile} className="self-start text-xs text-violet hover:text-lavender font-semibold mt-1 transition-colors">
                  + Add another file
                </button>
              </div>
            </div>

            {formErr && <p className="text-xs text-red-400 font-medium">{formErr}</p>}
            {formOk  && <p className="text-xs text-success font-medium">{formOk}</p>}

            <button type="submit" disabled={loading}
              className="self-start px-8 py-3 bg-purple hover:bg-neon rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50"
              style={{ boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </form>
        </div>
      )}

      {/* Manage tab */}
      {tab === "manage" && (
        <div className="bg-bg1 border border-[rgba(124,58,237,0.22)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-nmtext">Published Posts</h2>
            <button onClick={loadBlogs} className="text-xs text-subtle hover:text-violet transition-colors font-medium">
              Refresh
            </button>
          </div>
          {blogsLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-subtle">
              <div className="w-5 h-5 rounded-full border-2 border-[rgba(124,58,237,0.2)] border-t-purple animate-spin" />
              <span className="text-sm">Loading posts...</span>
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center text-subtle text-sm py-12">No blog posts yet. Create your first one!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {blogs.map(b => (
                <div key={b.id} className="flex items-start justify-between gap-4 p-4 bg-bg2 border border-[rgba(124,58,237,0.18)] rounded-xl hover:border-[rgba(124,58,237,0.3)] transition-colors">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-nmtext truncate" dangerouslySetInnerHTML={{ __html: b.title }} />
                    <p className="text-xs text-subtle mt-0.5">{new Date(b.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                    {b.excerpt && <p className="text-xs text-muted mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: b.excerpt }} />}
                  </div>
                  <button
                    onClick={() => deleteBlog(b.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[rgba(248,113,113,0.3)] text-red-400 text-xs font-semibold hover:bg-[rgba(248,113,113,0.1)] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
