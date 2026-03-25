import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function CtaBand() {
  return (
    <Card className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(197,243,107,0.16),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(57,202,239,0.18),_transparent_32%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs tracking-[0.22em] text-cyan-300 uppercase">
            Ready for live corridor planning
          </p>
          <h2 className="font-display text-3xl tracking-tight text-white">
            Turn future demand forecasts into lower delay and clearer travel
            decisions.
          </h2>
          <p className="text-sm leading-7 text-mist-300">
            Use the demo experience now, then connect a live traffic feed,
            routing engine, or city operations dashboard later without
            restructuring the app.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-cyan-300"
        >
          Request a tailored demo
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </Card>
  );
}
