import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-3xl items-center text-center",
      )}
    >
      <Badge>{eyebrow}</Badge>
      <div className="space-y-3">
        <h2 className="font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-mist-300">
          {description}
        </p>
      </div>
      {actions}
    </div>
  );
}
