"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utilities/cn";

const manufacturerLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/brands", label: "Brands" },
  { href: "/organisation", label: "Organisation" },
  { href: "/dashboard/api", label: "API usage" },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/audit-logs", label: "Audit logs" },
];

export function AppSidebar({ variant }: { variant: "manufacturer" | "admin" }) {
  const pathname = usePathname();
  const links = variant === "admin" ? adminLinks : manufacturerLinks;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-muted/20 lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
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
      </nav>
    </aside>
  );
}

export function MobileNav({ variant }: { variant: "manufacturer" | "admin" }) {
  const pathname = usePathname();
  const links = variant === "admin" ? adminLinks : manufacturerLinks;

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
