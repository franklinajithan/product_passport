import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("auth validation", () => {
  it("accepts a strong manufacturer registration", () => {
    const result = registerSchema.safeParse({
      name: "Anna Kowalska",
      email: "anna@example.com",
      password: "SecurePass1x",
      role: "MANUFACTURER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a weak password", () => {
    const result = registerSchema.safeParse({
      name: "Anna Kowalska",
      email: "anna@example.com",
      password: "short",
      role: "CONSUMER",
    });
    expect(result.success).toBe(false);
  });

  it("requires a valid login email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
    expect(
      loginSchema.safeParse({ email: "user@example.com", password: "x" }).success,
    ).toBe(true);
  });
});
