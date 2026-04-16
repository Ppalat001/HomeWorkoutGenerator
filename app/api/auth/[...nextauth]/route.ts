import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// NextAuth expects a catch-all API route at `/api/auth/*`.
// This file wires NextAuth's route handlers into the Next.js app router.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

