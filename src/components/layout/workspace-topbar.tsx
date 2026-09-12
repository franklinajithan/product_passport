"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  identifiers: "Identifiers",
  brands: "Brands",
  packaging: "Packaging",
  translations: "Translations",
  images: "Images",
  certifications: "Certifications",
  recalls: "Recalls",
  "api-keys": "API keys",
  webhooks: "Webhooks",
  analytics: "Analytics",
  audit: "Audit log",
  organisation: "Settings",
  admin: "Admin",
  organisations: "Organisations",
  users: "Users",
  claims: "Claims",
  duplicates: "Duplicates",
  standards: "Standards",
  reports: "Reports",
  "api-clients": "API clients",
};

export function WorkspaceTopbar({
  organisationName,
  notificationCount,
}: {
  organisationName: string;
  notificationCount: number;
}) {
  const pathname = usePathname();
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, all) => ({
      href: `/${all.slice(0, index + 1).join("/")}`,
      label: LABELS[segment] ?? segment,
    }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden>/</span> : null}
            <Link href={crumb.href} className={index === crumbs.length - 1 ? "font-medium text-foreground" : "hover:text-foreground"}>
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-md border border-border px-2.5 py-1">{organisationName}</span>
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          {notificationCount > 0 ? `${notificationCount} need attention` : "No alerts"}
        </Link>
      </div>
    </div>
  );
}
