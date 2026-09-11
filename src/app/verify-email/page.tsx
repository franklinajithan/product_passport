import Link from "next/link";
import { verifyEmailAction } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Alert variant="destructive">This verification link is incomplete.</Alert>
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Alert variant={result.ok ? "default" : "destructive"}>
        {result.ok ? result.message : result.error}
      </Alert>
      <Link href="/login" className="mt-6 inline-block text-sm hover:underline">
        Continue to sign in
      </Link>
    </div>
  );
}
