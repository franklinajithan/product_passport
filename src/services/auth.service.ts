import type { User } from "@prisma/client";
import { hashPassword } from "@/authentication/password";
import { prisma } from "@/database/client";
import { writeAuditLog } from "@/services/audit.service";
import { passwordResetEmail, sendEmail, verificationEmail } from "@/services/email.service";
import { ConflictError, NotFoundError } from "@/utilities/errors";
import { AUTH_TOKEN_TTL_HOURS } from "@/utilities/constants";
import { generateToken, hashToken, hoursFromNow } from "@/utilities/crypto";
import type { RegisterInput } from "@/validation/auth";

export async function registerUser(input: RegisterInput): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ConflictError("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      status: "PENDING_EMAIL_VERIFICATION",
    },
  });

  await issueEmailVerification(user.id, user.email);
  await writeAuditLog({
    actorId: user.id,
    action: "user.registered",
    entityType: "User",
    entityId: user.id,
    metadata: { role: user.role },
  });

  return user;
}

export async function issueEmailVerification(userId: string, email: string): Promise<void> {
  const token = generateToken();
  const tokenHash = hashToken(token);

  await prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: hoursFromNow(AUTH_TOKEN_TTL_HOURS.EMAIL_VERIFICATION),
    },
  });

  await sendEmail(verificationEmail(email, token));
}

export async function verifyEmailToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new NotFoundError("This verification link is invalid or has expired.");
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerified: new Date(),
        status: record.user.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
      },
    }),
  ]);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return;
  }

  const token = generateToken();
  const tokenHash = hashToken(token);

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: hoursFromNow(AUTH_TOKEN_TTL_HOURS.PASSWORD_RESET),
    },
  });

  await sendEmail(passwordResetEmail(user.email, token));
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new NotFoundError("This reset link is invalid or has expired.");
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
  ]);
}
