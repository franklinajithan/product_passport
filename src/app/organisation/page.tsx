import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { canManageOrganisation } from "@/authentication/permissions";
import { OrganisationStatusBadge } from "@/components/feedback/status-badges";
import { InviteMemberForm } from "@/features/organisation/components/invite-member-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OrganisationPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    redirect("/organisation/setup");
  }

  const { organisation } = membership;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{organisation.name}</h1>
          <p className="text-sm text-muted-foreground">{organisation.legalName}</p>
        </div>
        <OrganisationStatusBadge status={organisation.status} />
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="Registration number" value={organisation.registrationNumber} />
          <Detail label="VAT / tax number" value={organisation.vatNumber} />
          <Detail label="Country" value={organisation.country.name} />
          <Detail
            label="Address"
            value={`${organisation.addressLine1}, ${organisation.city} ${organisation.postalCode}`}
          />
          <Detail label="Business email" value={organisation.businessEmail} />
          <Detail label="Phone" value={organisation.phone} />
          <Detail label="Website" value={organisation.website} />
          <Detail label="GS1 prefix" value={organisation.gs1CompanyPrefix} />
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="divide-y rounded-lg border border-border">
            {organisation.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  {member.user.name ?? member.user.email}
                  <span className="ml-2 text-muted-foreground">{member.user.email}</span>
                </span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {member.role}
                </span>
              </li>
            ))}
          </ul>
          {canManageOrganisation(user, membership.role) ? <InviteMemberForm /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "—"}</p>
    </div>
  );
}
