"use client";

import { captureError } from "@/lib/observability";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  captureError(error, { boundary: "global" });

  return (
    <html lang="en">
      <body className="bg-ink-950 p-6 text-white">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center">
          <div className="rounded-[32px] border border-white/10 bg-white/4 p-8">
            <h1 className="font-display text-3xl">
              Unexpected application error
            </h1>
            <p className="mt-3 text-sm leading-7 text-mist-300">
              A global error boundary caught an unhandled issue. Check server
              logs or configured monitoring to inspect the failure.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
