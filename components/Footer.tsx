export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[rgba(124,58,237,0.22)]">
      <div className="max-w-6xl mx-auto px-6 py-7 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-subtle">
          (c) 2023-2026{" "}
          <a href="mailto:rishiewas2010@gmail.com" className="hover:text-violet transition-colors">Rishies2010</a>
          {" "}- Season 3 - The NomadLife Nexus
        </p>
        <div className="flex gap-5">
          <a href="https://dsc.gg/nomadlife" target="_blank" rel="noopener noreferrer" className="text-[13px] text-subtle hover:text-violet transition-colors">Discord ?</a>
          <a href="/admin" className="text-[13px] text-subtle hover:text-violet transition-colors">Admin</a>
        </div>
      </div>
    </footer>
  );
}
