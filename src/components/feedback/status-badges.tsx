import { Badge } from "@/components/ui/badge";
import type { OrganisationStatus, ProductStatus, UserStatus, VerificationLevel } from "@prisma/client";

export function OrganisationStatusBadge({ status }: { status: OrganisationStatus }) {
  const map = {
    PENDING_VERIFICATION: { variant: "warning" as const, label: "Pending verification" },
    VERIFIED: { variant: "success" as const, label: "Verified" },
    REJECTED: { variant: "destructive" as const, label: "Rejected" },
    SUSPENDED: { variant: "destructive" as const, label: "Suspended" },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const map = {
    DRAFT: { variant: "secondary" as const, label: "Draft" },
    PENDING_VERIFICATION: { variant: "warning" as const, label: "Pending verification" },
    ACTIVE: { variant: "success" as const, label: "Active" },
    DISCONTINUED: { variant: "warning" as const, label: "Discontinued" },
    WITHDRAWN: { variant: "warning" as const, label: "Withdrawn" },
    RECALLED: { variant: "destructive" as const, label: "Recalled" },
    SUPERSEDED: { variant: "secondary" as const, label: "Superseded" },
    ARCHIVED: { variant: "secondary" as const, label: "Archived" },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const map = {
    PENDING_EMAIL_VERIFICATION: { variant: "warning" as const, label: "Unverified email" },
    ACTIVE: { variant: "success" as const, label: "Active" },
    SUSPENDED: { variant: "destructive" as const, label: "Suspended" },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function VerificationBadge({
  level,
  lastVerifiedAt,
}: {
  level: VerificationLevel;
  lastVerifiedAt?: Date | string | null;
}) {
  if (level === "MANUFACTURER_VERIFIED") {
    return (
      <div>
        <Badge variant="success">✓ Manufacturer Verified</Badge>
        {lastVerifiedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Last verified:{" "}
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(lastVerifiedAt))}
          </p>
        ) : null}
      </div>
    );
  }

  if (level === "DISTRIBUTOR_VERIFIED") {
    return <Badge variant="default">Distributor Verified</Badge>;
  }

  return <Badge variant="secondary">Community</Badge>;
}
