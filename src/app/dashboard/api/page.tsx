import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import { StatCard } from "@/components/feedback/stat-card";

export default async function ApiUsagePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const membership = await getMembershipForUser(user.id);
  const organisationId = membership?.organisationId;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [keys, usage] = await Promise.all([
    organisationId
      ? prisma.aPIKey.count({ where: { organisationId, revokedAt: null } })
      : prisma.aPIKey.count({ where: { userId: user.id, revokedAt: null } }),
    organisationId
      ? prisma.aPIUsage.count({
          where: { occurredAt: { gte: monthStart }, apiKey: { organisationId } },
        })
      : prisma.aPIUsage.count({
          where: { occurredAt: { gte: monthStart }, apiKey: { userId: user.id } },
        }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API usage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The public product API is available now. Signed keys, plan limits and revocation
          land in the developer portal phase.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active keys" value={keys} />
        <StatCard label="Requests this month" value={usage} />
        <StatCard label="Current plan" value="FREE" hint="10,000 requests / month when keys are issued" />
      </div>
    </div>
  );
}
