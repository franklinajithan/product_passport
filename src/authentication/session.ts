import { cache } from "react";
import { auth } from "@/authentication/auth";
import type { SessionUser } from "@/types/auth";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    role: session.user.role,
    status: session.user.status,
  };
});
