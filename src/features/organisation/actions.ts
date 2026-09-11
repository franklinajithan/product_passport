"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { canAccessAdmin, canManageOrganisation } from "@/authentication/permissions";
import {
  addOrganisationMember,
  createOrganisationForUser,
  getMembershipForUser,
  reviewOrganisation,
  setOrganisationStatus,
  setUserStatus,
} from "@/services/organisation.service";
import type { ActionResult } from "@/types";
import { getErrorMessage, UnauthorizedError, ForbiddenError } from "@/utilities/errors";
import {
  inviteMemberSchema,
  organisationWizardSchema,
  reviewOrganisationSchema,
  suspendEntitySchema,
} from "@/validation/organisation";

export async function createOrganisationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const parsed = organisationWizardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([key, value]) => [key, value ?? []]),
      ),
    };
  }

  try {
    const organisation = await createOrganisationForUser(user.id, user.role, parsed.data);
    revalidatePath("/dashboard");
    return { ok: true, data: { id: organisation.id } };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function inviteMemberAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You need to sign in." };
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership || !canManageOrganisation(user, membership.role)) {
    return { ok: false, error: "Only organisation owners and admins can add team members." };
  }

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and role." };
  }

  try {
    await addOrganisationMember({
      organisationId: membership.organisationId,
      actorId: user.id,
      email: parsed.data.email,
      role: parsed.data.role,
    });
    revalidatePath("/organisation");
    return { ok: true, data: undefined, message: "Team member added." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function reviewOrganisationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) {
    return { ok: false, error: "Admin access required." };
  }

  const parsed = reviewOrganisationSchema.safeParse({
    organisationId: formData.get("organisationId"),
    decision: formData.get("decision"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid review request." };
  }

  try {
    await reviewOrganisation({
      actorId: user.id,
      organisationId: parsed.data.organisationId,
      decision: parsed.data.decision,
      note: parsed.data.note,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/companies");
    return { ok: true, data: undefined, message: "Organisation updated." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function suspendOrganisationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) {
    throw new ForbiddenError();
  }

  const parsed = suspendEntitySchema.safeParse({
    id: formData.get("id"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Provide a reason for this action." };
  }

  try {
    await setOrganisationStatus({
      actorId: user.id,
      organisationId: parsed.data.id,
      status: "SUSPENDED",
      reason: parsed.data.reason,
    });
    revalidatePath("/admin/companies");
    return { ok: true, data: undefined, message: "Organisation suspended." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function suspendUserAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) {
    throw new ForbiddenError();
  }

  const parsed = suspendEntitySchema.safeParse({
    id: formData.get("id"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Provide a reason for this action." };
  }

  try {
    await setUserStatus({
      actorId: user.id,
      userId: parsed.data.id,
      status: "SUSPENDED",
      reason: parsed.data.reason,
    });
    revalidatePath("/admin/users");
    return { ok: true, data: undefined, message: "User suspended." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function finishOrganisationSetup(): Promise<void> {
  redirect("/dashboard");
}
