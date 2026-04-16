import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserPreferences } from "@/lib/preferences";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const preferences = await getUserPreferences(session.user.id);

  if (!preferences) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
