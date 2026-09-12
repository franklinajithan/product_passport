import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function ProductLoading() {
  return (
    <PageContainer className="space-y-6 py-10">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </PageContainer>
  );
}
