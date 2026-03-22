import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="space-y-6 py-12">
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-6 w-full max-w-3xl" />
      <Skeleton className="h-80 w-full rounded-[32px]" />
    </div>
  );
}
