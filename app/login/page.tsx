"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Dumbbell } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "register") {
        const registerRes = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          setError(registerData.error || "Could not create account");
          setLoading(false);
          return;
        }

        // Avoid auto-login here; it can hit NextAuth routes and show 404
        // if the NextAuth API route is misconfigured. Let the user log in manually.
        setError("");
        setMessage("Account created. Please sign in.");
        setMode("login");
        setPassword("");
        router.refresh();
        return;
      }

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/beginner");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Smart Workout
            </span>
          </div>

          <nav className="hidden gap-8 text-sm text-white/80 md:flex">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/workout" className="transition hover:text-white">
              Today&apos;s Workout
            </Link>
            <Link href="/history" className="transition hover:text-white">
              History
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>

            <div className="mb-4 flex rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-cyan-500 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setMessage("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === "register"
                    ? "bg-cyan-500 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-3 text-sm text-white/70">
              {mode === "login"
                ? "Sign in to continue your adaptive home workout journey"
                : "Register to start your adaptive home workout journey"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-white/85"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white/85"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white/85"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder={
                  mode === "login"
                    ? "Enter your password"
                    : "Create a password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
              />
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/70">
                  <input type="checkbox" className="rounded border-white/20" />
                  Remember me
                </label>

                <Link
                  href="#"
                  className="text-cyan-400 transition hover:text-cyan-300"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? mode === "login"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/65">
            {mode === "login" ? "Don&apos;t have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
                setMessage("");
              }}
              className="font-medium text-cyan-400 hover:text-cyan-300"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}