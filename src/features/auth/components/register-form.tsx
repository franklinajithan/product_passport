"use client";

import { useActionState } from "react";
import { registerAction } from "@/features/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/types";

const initial: ActionResult = { ok: false, error: "" };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state.ok === false && state.error ? <Alert variant="destructive">{state.error}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required minLength={2} autoComplete="name" />
        {state.ok === false && state.fieldErrors?.name ? (
          <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        <p className="text-xs text-muted-foreground">
          At least 10 characters, with uppercase, lowercase and a number.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">I am registering as</Label>
        <Select id="role" name="role" defaultValue="MANUFACTURER" required>
          <option value="MANUFACTURER">Manufacturer / brand owner</option>
          <option value="DISTRIBUTOR">Distributor / importer</option>
          <option value="RETAILER">Retailer</option>
          <option value="DEVELOPER">Developer</option>
          <option value="CONSUMER">Consumer</option>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
