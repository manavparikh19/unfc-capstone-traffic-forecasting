"use client";

import { captureError } from "@/lib/observability";
import { StatePanel } from "@/components/ui/state-panel";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  captureError(error, { boundary: "marketing" });

  return (
    <StatePanel
      state="error"
      title="Something went wrong"
      description="The page failed to render. Try the request again."
      action={
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm text-white"
        >
          Retry
        </button>
      }
    />
  );
}
