"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/authentication/auth";
import { prisma } from "@/database/client";
import { getErrorMessage } from "@/utilities/errors";
import { enforceRateLimit } from "@/utilities/rate-limit";
import {
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmailToken,
} from "@/services/auth.service";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/validation/auth";
import type { ActionResult } from "@/types";

function fieldErrorsFromZod(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const flattened = error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(flattened).map(([key, value]) => [key, value ?? []]),
  );
}

export async function registerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    enforceRateLimit({ key: `register:${parsed.data.email}`, limit: 5, windowMs: 10 * 60 * 1000 });
    await registerUser(parsed.data);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  redirect(`/login?registered=1&email=${encodeURIComponent(parsed.data.email)}`);
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and password." };
  }

  try {
    enforceRateLimit({ key: `login:${parsed.data.email}`, limit: 8, windowMs: 10 * 60 * 1000 });

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { status: true },
    });

    if (existing?.status === "PENDING_EMAIL_VERIFICATION") {
      return {
        ok: false,
        error: "Please verify your email address before signing in. Check your inbox for the confirmation link.",
      };
    }

    if (existing?.status === "SUSPENDED") {
      return { ok: false, error: "This account has been suspended." };
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }

  return { ok: true, data: undefined };
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  try {
    enforceRateLimit({ key: `forgot:${parsed.data.email}`, limit: 5, windowMs: 15 * 60 * 1000 });
    await requestPasswordReset(parsed.data.email);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  return {
    ok: true,
    data: undefined,
    message: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  try {
    await resetPassword(parsed.data.token, parsed.data.password);
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }

  redirect("/login?reset=1");
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  try {
    await verifyEmailToken(token);
    return { ok: true, data: undefined, message: "Your email has been verified. You can now sign in." };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
