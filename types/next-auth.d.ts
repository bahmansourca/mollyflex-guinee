import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: string;
    role?: "ADMIN" | "WORKER";
    user?: DefaultSession["user"] & { username?: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "ADMIN" | "WORKER";
    username?: string;
  }
}


