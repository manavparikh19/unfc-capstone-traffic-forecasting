import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-mist-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/60 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
