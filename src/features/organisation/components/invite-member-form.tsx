"use client";

import { useActionState } from "react";
import { inviteMemberAction } from "@/features/organisation/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/types";

const initial: ActionResult = { ok: false, error: "" };

export function InviteMemberForm() {
  const [state, formAction, pending] = useActionState(inviteMemberAction, initial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
      {state.ok === false && state.error ? (
        <div className="sm:col-span-3">
          <Alert variant="destructive">{state.error}</Alert>
        </div>
      ) : null}
      {state.ok === true && state.message ? (
        <div className="sm:col-span-3">
          <Alert>{state.message}</Alert>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Team member email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="EDITOR">
          <option value="ADMIN">Admin</option>
          <option value="EDITOR">Editor</option>
          <option value="VIEWER">Viewer</option>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add member"}
        </Button>
      </div>
    </form>
  );
}
