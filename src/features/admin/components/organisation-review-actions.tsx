"use client";

import { useActionState } from "react";
import { reviewOrganisationAction } from "@/features/organisation/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/types";

const initial: ActionResult = { ok: false, error: "" };

export function OrganisationReviewActions({ organisationId }: { organisationId: string }) {
  const [state, formAction, pending] = useActionState(reviewOrganisationAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="organisationId" value={organisationId} />
      <Textarea name="note" placeholder="Review note (optional)" />
      {state.ok === false && state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.ok === true && state.message ? (
        <p className="text-xs text-emerald-700">{state.message}</p>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          name="decision"
          value="VERIFIED"
          size="sm"
          disabled={pending}
        >
          Verify
        </Button>
        <Button
          type="submit"
          name="decision"
          value="REJECTED"
          size="sm"
          variant="outline"
          disabled={pending}
        >
          Reject
        </Button>
      </div>
    </form>
  );
}
