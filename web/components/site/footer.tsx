import Link from "next/link";

const mono = { fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" as const };

export function Footer() {
  return (
    <footer className="mt-12 brutal-border bg-white mx-4 mb-4 lg:mx-8 p-6 flex flex-wrap justify-between items-center gap-6" style={mono}>
      <div className="flex gap-6 flex-wrap items-center">
        <span>©{new Date().getFullYear()} Traffic Intelligence Platform</span>
        <span style={{ color: "#ff3e00" }}>Capstone Project</span>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <span className="hidden sm:inline text-slate-500">1,240 Intersections | 8 Corridors</span>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black text-white">
          <div className="w-1.5 h-1.5 bg-lime-400 animate-pulse" />
          <span className="text-[9px]">System Active</span>
        </div>
      </div>

      <nav className="flex flex-wrap gap-5">
        {[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/forecasting", label: "Forecasting" },
          { href: "/signal-optimization", label: "Signals" },
          { href: "/route-planner", label: "Scenarios" },
          { href: "/hotspots", label: "Hotspots" },
          { href: "/about", label: "Methodology" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-[#ff3e00]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
