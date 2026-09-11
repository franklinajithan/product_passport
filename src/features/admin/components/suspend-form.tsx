"use client";

import { useActionState } from "react";
import { suspendOrganisationAction, suspendUserAction } from "@/features/organisation/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/types";

const initial: ActionResult = { ok: false, error: "" };

export function SuspendForm({
  id,
  entity,
}: {
  id: string;
  entity: "user" | "organisation";
}) {
  const action = entity === "user" ? suspendUserAction : suspendOrganisationAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="id" value={id} />
      <Input name="reason" placeholder="Reason" required className="sm:w-64" />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        Suspend
      </Button>
      {state.ok === false && state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
