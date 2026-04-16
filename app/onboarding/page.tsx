import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserPreferences } from "@/lib/preferences";
import OnboardingForm from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const existing = await getUserPreferences(session.user.id);
  if (existing) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
