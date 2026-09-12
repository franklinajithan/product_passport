import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function HomeLoading() {
  return (
    <PageContainer className="grid gap-8 py-20 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-2/3" />
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
    </PageContainer>
  );
}
