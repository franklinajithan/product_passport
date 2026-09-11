import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { prisma } from "@/database/client";
import { OrganisationWizard } from "@/features/organisation/components/organisation-wizard";
import type { OrganisationWizardInput } from "@/validation/organisation";

function defaultTypeForRole(role: string): OrganisationWizardInput["type"] {
  if (role === "DISTRIBUTOR") return "DISTRIBUTOR";
  if (role === "RETAILER") return "RETAILER";
  return "MANUFACTURER";
}

export default async function OrganisationSetupPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const existing = await prisma.organisationMember.findFirst({
    where: { userId: user.id },
  });

  if (existing) {
    redirect("/dashboard");
  }

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, iso2: true },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Organisation setup</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us about the company. The organisation starts as pending verification.
      </p>
      <div className="mt-8">
        <OrganisationWizard
          countries={countries}
          defaultType={defaultTypeForRole(user.role)}
        />
      </div>
    </div>
  );
}
