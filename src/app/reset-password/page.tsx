import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      {!token ? (
        <p className="mt-4 text-sm text-muted-foreground">
          This reset link is missing a token. Request a new one from the{" "}
          <Link href="/forgot-password" className="underline">
            forgot password
          </Link>{" "}
          page.
        </p>
      ) : (
        <div className="mt-8">
          <ResetPasswordForm token={token} />
        </div>
      )}
    </div>
  );
}
