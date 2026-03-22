"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackEvent } from "@/lib/observability";

export function AnalyticsBridge() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent("page.viewed", {
      pathname,
      query: searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}
