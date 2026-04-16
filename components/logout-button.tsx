"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-400"
    >
      Logout
    </button>
  );
}