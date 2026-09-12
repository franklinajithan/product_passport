"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utilities/cn";

const manufacturerGroups = [
  {
    label: "Workspace",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/products", label: "Products" },
      { href: "/dashboard/identifiers", label: "Identifiers" },
      { href: "/dashboard/brands", label: "Brands" },
      { href: "/dashboard/packaging", label: "Packaging" },
      { href: "/dashboard/translations", label: "Translations" },
      { href: "/dashboard/images", label: "Images" },
      { href: "/dashboard/certifications", label: "Certifications" },
      { href: "/dashboard/recalls", label: "Recalls" },
    ],
  },
  {
    label: "Platform",
    links: [
      { href: "/dashboard/api-keys", label: "API keys" },
      { href: "/dashboard/webhooks", label: "Webhooks" },
      { href: "/dashboard/analytics", label: "Analytics" },
      { href: "/dashboard/audit", label: "Audit log" },
      { href: "/organisation", label: "Settings" },
    ],
  },
];

const adminGroups = [
  {
    label: "Admin",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/organisations", label: "Organisations" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/claims", label: "Claims" },
      { href: "/admin/duplicates", label: "Duplicates" },
      { href: "/admin/standards", label: "Standards" },
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/audit", label: "Audit" },
      { href: "/admin/api-clients", label: "API clients" },
    ],
  },
];

export function AppSidebar({ variant }: { variant: "manufacturer" | "admin" }) {
  const pathname = usePathname();
  const groups = variant === "admin" ? adminGroups : manufacturerGroups;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-muted/20 lg:block">
      <nav className="flex flex-col gap-6 p-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </p>
            <div className="mt-2 flex flex-col gap-0.5">
              {group.links.map((link) => {
                const active =
                  link.href === "/dashboard" || link.href === "/admin"
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-background font-medium text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav({ variant }: { variant: "manufacturer" | "admin" }) {
  const pathname = usePathname();
  const links = (variant === "admin" ? adminGroups : manufacturerGroups).flatMap((group) => group.links);

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3 lg:hidden">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 text-xs",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
