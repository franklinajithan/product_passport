import { redirect } from "next/navigation";
import { AppSidebar, MobileNav } from "@/components/layout/app-sidebar";
import { getCurrentUser } from "@/authentication/session";
import { canAccessAdmin } from "@/authentication/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AppSidebar variant="admin" />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav variant="admin" />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
