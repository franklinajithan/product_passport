import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; email?: string; reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Access your manufacturer, retailer or developer workspace.
      </p>
      {params.registered ? (
        <p className="mt-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          Account created. Verify your email, then sign in. In local development the
          verification link is printed in the server console.
        </p>
      ) : null}
      {params.reset ? (
        <p className="mt-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          Password updated. You can sign in with your new password.
        </p>
      ) : null}
      <div className="mt-8">
        <LoginForm defaultEmail={params.email} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
