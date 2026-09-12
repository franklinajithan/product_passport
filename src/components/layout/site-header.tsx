import { getCurrentUser } from "@/authentication/session";
import { SiteHeaderNav } from "@/components/layout/site-nav";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <SiteHeaderNav
      user={user ? { email: user.email, name: user.name, role: user.role } : null}
    />
  );
}
