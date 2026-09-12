import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { ApiKeysManager } from "./keys-manager";

export default async function ApiKeysPage() {
  const { user, membership } = await requireWorkspace();
  const keys = await prisma.aPIKey.findMany({
    where: { organisationId: membership.organisationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Secrets are hashed. The raw key is shown once at creation. Organisation {membership.organisation.name} — signed in as {user.email}.
      </p>
      <div className="mt-6">
        <ApiKeysManager
          initialKeys={keys.map((key) => ({
            ...key,
            lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
            revokedAt: key.revokedAt?.toISOString() ?? null,
            createdAt: key.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
