import Link from "next/link";
import { APP_NAME } from "@/utilities/constants";
import { getCurrentUser } from "@/authentication/session";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            GPR
          </span>
          <span className="hidden text-sm font-semibold sm:inline">{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Button variant="ghost" asChild>
            <Link href="/search">Search</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/developers">Developers</Link>
          </Button>
          <ThemeToggle />
          {user ? (
            <UserMenu email={user.email} name={user.name} role={user.role} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
