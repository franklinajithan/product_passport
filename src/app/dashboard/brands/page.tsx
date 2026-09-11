import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function BrandsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    redirect("/organisation/setup");
  }

  const brands = await prisma.brand.findMany({
    where: { organisationId: membership.organisationId },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  if (brands.length === 0) {
    return (
      <EmptyState
        title="No brands yet"
        description="Brands are created during organisation setup. Add more from the organisation wizard or a later brand manager."
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {brands.map((brand) => (
          <article key={brand.id} className="rounded-xl border border-border p-5">
            <h2 className="font-semibold">{brand.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {brand._count.products} product{brand._count.products === 1 ? "" : "s"}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
