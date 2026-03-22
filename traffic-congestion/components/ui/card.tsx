import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn("panel rounded-[28px] border border-white/8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
