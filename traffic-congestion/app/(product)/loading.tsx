import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="space-y-6 py-12">
      <Skeleton className="h-12 w-1/2" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[28px]" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-[32px]" />
    </div>
  );
}
