import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function ImagesManagerPage() {
  const { membership } = await requireWorkspace();
  const images = await prisma.productImage.findMany({
    where: { product: { organisationId: membership.organisationId } },
    include: { product: { include: { translations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
      {images.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No images uploaded"
            description="Front, back, nutrition and ingredients images will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <figure key={image.id} className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.altText ?? ""} className="h-40 w-full object-cover" />
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">{image.type}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
