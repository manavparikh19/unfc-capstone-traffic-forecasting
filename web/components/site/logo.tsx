import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3"
      aria-label="Traffic Congestion home"
    >
      <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/30 bg-white/8">
        <span className="absolute inset-[7px] rounded-xl border border-cyan-300/35" />
        <span className="h-4 w-4 rounded-full bg-gradient-to-br from-cyan-300 to-lime-300" />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-base font-semibold tracking-tight text-white">
          Traffic Congestion
        </span>
        <span className="text-xs tracking-[0.18em] text-mist-300 uppercase">
          Future traffic intelligence
        </span>
      </span>
    </Link>
  );
}
