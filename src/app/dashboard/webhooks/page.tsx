import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { WebhookManager } from "./webhook-manager";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function WebhooksPage() {
  const { membership } = await requireWorkspace();
  const hooks = await prisma.webhook.findMany({
    where: { organisationId: membership.organisationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivery secrets are hashed. Failures and last delivery timestamps will appear on each endpoint.
        </p>
        <div className="mt-6">
          <WebhookManager />
        </div>
      </div>
      <div>
        {hooks.length === 0 ? (
          <EmptyState title="No endpoints yet" description="Create an endpoint to receive product and identifier events." />
        ) : (
          <ul className="space-y-3 text-sm">
            {hooks.map((hook) => (
              <li key={hook.id} className="rounded-xl border border-border p-4">
                <p className="font-mono text-xs">{hook.endpoint}</p>
                <p className="mt-2 text-muted-foreground">
                  {hook.status} · failures {hook.failureCount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
