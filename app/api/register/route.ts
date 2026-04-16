import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const password = body.password?.trim() || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await createUser({ name, email, password });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    const status = message === "User already exists" ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}