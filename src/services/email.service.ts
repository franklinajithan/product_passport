type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function appUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = process.env.EMAIL_FROM ?? "Global Product Registry <noreply@localhost>";

  if (process.env.SMTP_HOST) {
    console.info(
      `[email] SMTP delivery is configured but not implemented in Phase 1. Queued mail from ${from} to ${payload.to}: ${payload.subject}`,
    );
    return;
  }

  console.info("----- EMAIL (development) -----");
  console.info(`From: ${from}`);
  console.info(`To: ${payload.to}`);
  console.info(`Subject: ${payload.subject}`);
  console.info(payload.text);
  console.info("-------------------------------");
}

export function verificationEmail(to: string, token: string): EmailPayload {
  const url = `${appUrl()}/verify-email?token=${token}`;
  return {
    to,
    subject: "Verify your Global Product Registry account",
    text: `Confirm your email address by opening this link:\n${url}\n\nThis link expires in 24 hours.`,
  };
}

export function passwordResetEmail(to: string, token: string): EmailPayload {
  const url = `${appUrl()}/reset-password?token=${token}`;
  return {
    to,
    subject: "Reset your Global Product Registry password",
    text: `Reset your password by opening this link:\n${url}\n\nThis link expires in 2 hours. If you did not request a reset, you can ignore this email.`,
  };
}
