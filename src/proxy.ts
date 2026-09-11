import NextAuth from "next-auth";
import { authConfig } from "@/authentication/config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/organisation/:path*",
    "/login",
    "/register",
  ],
};
