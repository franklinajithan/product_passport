"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/authentication/session";
import { canEditOrganisationProducts } from "@/authentication/permissions";
import { getMembershipForUser } from "@/services/organisation.service";
import {
  addPackagingLink,
  createOrganisationProduct,
  createProductVariant,
  duplicateOrganisationProduct,
  publishOrganisationProduct,
  retireOrganisationIdentifier,
  retireOrganisationProduct,
  updateOrganisationProduct,
  upsertProductTranslation,
} from "@/services/product-write.service";
import type { ActionResult } from "@/types";
import { getErrorMessage } from "@/utilities/errors";
import {
  identifierRetireSchema,
  packagingLinkSchema,
  productCreateSchema,
  productIdSchema,
  productRetireSchema,
  productUpdateSchema,
  productVariantSchema,
  publishProductSchema,
  translationUpsertSchema,
} from "@/validation/product";

async function requireEditor() {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, error: "You need to sign in." };
  }
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return { ok: false as const, error: "Organisation required." };
  }
  if (
    !canEditOrganisationProducts(
      user,
      membership.role,
      membership.organisationId,
      membership.organisationId,
    )
  ) {
    return { ok: false as const, error: "You do not have permission to change products." };
  }
  return { ok: true as const, user, membership };
}

export async function createProductAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = productCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please correct the highlighted fields.",
    };
  }
  try {
    const product = await createOrganisationProduct({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      input: parsed.data,
    });
    revalidatePath("/dashboard/products");
    return { ok: true, data: { id: product.id } };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function duplicateProductAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = productIdSchema.safeParse({ productId: formData.get("productId") });
  if (!parsed.success) {
    return { ok: false, error: "Product is required." };
  }
  try {
    const product = await duplicateOrganisationProduct({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      productId: parsed.data.productId,
    });
    revalidatePath("/dashboard/products");
    return { ok: true, data: { id: product.id } };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function createVariantAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = productVariantSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Variant details are required." };
  }
  try {
    const product = await createProductVariant({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      productId: parsed.data.productId,
      variantLabel: parsed.data.variantLabel,
      gtin: parsed.data.gtin || undefined,
    });
    revalidatePath("/dashboard/products");
    return { ok: true, data: { id: product.id } };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updateProductAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please correct the fields." };
  }
  try {
    const result = await updateOrganisationProduct({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      input: parsed.data,
    });
    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${result.productId}/edit`);
    return { ok: true, data: { id: result.productId }, message: result.decision };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function publishProductAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = publishProductSchema.safeParse({ productId: formData.get("productId") });
  if (!parsed.success) {
    return { ok: false, error: "Product is required." };
  }
  try {
    await publishOrganisationProduct({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      productId: parsed.data.productId,
      organisationStatus: auth.membership.organisation.status,
    });
    revalidatePath("/dashboard/products");
    return { ok: true, data: undefined, message: "Product published." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function retireProductAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = productRetireSchema.safeParse({
    productId: formData.get("productId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "A retirement reason is required." };
  }
  try {
    await retireOrganisationProduct({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      productId: parsed.data.productId,
      reason: parsed.data.reason,
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/identifiers");
    return { ok: true, data: undefined, message: "Product discontinued. Identifier history is retained." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function addPackagingLinkAction(input: unknown): Promise<ActionResult> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = packagingLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Packaging fields are required." };
  }
  try {
    await addPackagingLink({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      input: parsed.data,
    });
    revalidatePath("/dashboard/packaging");
    return { ok: true, data: undefined, message: "Packaging relationship saved." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function upsertTranslationAction(input: unknown): Promise<ActionResult> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = translationUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Translation fields are required." };
  }
  try {
    await upsertProductTranslation({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      input: parsed.data,
    });
    revalidatePath("/dashboard/translations");
    return { ok: true, data: undefined, message: "Translation saved." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function retireIdentifierAction(formData: FormData): Promise<ActionResult> {
  const auth = await requireEditor();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const parsed = identifierRetireSchema.safeParse({
    identifierId: formData.get("identifierId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "A retirement reason is required." };
  }
  try {
    await retireOrganisationIdentifier({
      organisationId: auth.membership.organisationId,
      actorId: auth.user.id,
      identifierId: parsed.data.identifierId,
      reason: parsed.data.reason,
    });
    revalidatePath("/dashboard/identifiers");
    return { ok: true, data: undefined, message: "Identifier retired. History is retained." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
