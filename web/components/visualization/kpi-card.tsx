import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Card className="space-y-4 px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-mist-300">{label}</p>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-cyan-300">
          {icon}
        </div>
      </div>
      <div>
        <p className="font-display text-3xl tracking-tight text-white">
          {value}
        </p>
        <p className="mt-2 text-sm leading-6 text-mist-300">{hint}</p>
      </div>
    </Card>
  );
}
