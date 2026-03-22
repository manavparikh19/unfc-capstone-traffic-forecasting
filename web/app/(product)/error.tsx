"use client";

import { captureError } from "@/lib/observability";
import { StatePanel } from "@/components/ui/state-panel";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  captureError(error, { boundary: "product" });

  return (
    <StatePanel
      state="error"
      title="The product view could not load"
      description="This surface hit an unexpected error. Retry the render or return to the dashboard."
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
