import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";

export async function requireWorkspace() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    redirect("/organisation/setup");
  }

  return { user, membership };
}
