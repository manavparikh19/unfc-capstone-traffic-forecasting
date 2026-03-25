import type { ReactNode } from "react";

import { AlertTriangle, LoaderCircle, SearchX } from "lucide-react";

import { Card } from "@/components/ui/card";

const icons = {
  loading: LoaderCircle,
  empty: SearchX,
  error: AlertTriangle,
};

export function StatePanel({
  state,
  title,
  description,
  action,
}: {
  state: keyof typeof icons;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const Icon = icons[state];

  return (
    <Card className="flex min-h-64 flex-col items-center justify-center gap-4 px-8 py-10 text-center">
      <div className="rounded-full border border-white/10 bg-white/6 p-4">
        <Icon
          className={`size-6 text-cyan-300 ${state === "loading" ? "animate-spin" : ""}`}
        />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">{title}</h2>
        <p className="max-w-xl text-sm leading-6 text-mist-300">
          {description}
        </p>
      </div>
      {action}
    </Card>
  );
}
