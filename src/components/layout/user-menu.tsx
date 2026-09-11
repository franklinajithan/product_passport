"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/features/auth/actions";
import { titleFromRole } from "@/utilities/format";
import type { UserRole } from "@prisma/client";

export function UserMenu({
  email,
  name,
  role,
}: {
  email: string;
  name: string | null;
  role: UserRole;
}) {
  const dashboardHref = role === "SUPER_ADMIN" ? "/admin" : "/dashboard";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-1 inline-flex h-10 items-center rounded-md px-3 text-sm font-medium hover:bg-muted">
        {name ?? email}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {titleFromRole(role)}
        </div>
        <DropdownMenuItem asChild>
          <Link href={dashboardHref}>Dashboard</Link>
        </DropdownMenuItem>
        {role !== "SUPER_ADMIN" && role !== "CONSUMER" ? (
          <DropdownMenuItem asChild>
            <Link href="/organisation">Organisation</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onSelect={() => {
            void signOutAction();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
