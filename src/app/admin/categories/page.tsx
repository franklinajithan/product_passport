import { prisma } from "@/database/client";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { children: true },
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <div className="mt-6 space-y-4">
        {categories.map((category) => (
          <article key={category.id} className="rounded-xl border border-border p-5">
            <h2 className="font-semibold">{category.name}</h2>
            <p className="text-sm text-muted-foreground">{category.description}</p>
            {category.children.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {category.children.map((child) => (
                  <li
                    key={child.id}
                    className="rounded-full border border-border px-3 py-1 text-xs"
                  >
                    {child.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
