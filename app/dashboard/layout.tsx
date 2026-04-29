import type { ReactNode } from "react";
import { auth } from "@/auth";
import HeartHealthDoctorBanner from "@/components/heart-health-doctor-banner";
import { evaluateHeartDoctorSuggestion } from "@/lib/heart-health-alerts";
import { getUserPreferences } from "@/lib/preferences";
import { getWorkoutHistory } from "@/lib/workout-history";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <>{children}</>;
  }

  const preferences = await getUserPreferences(session.user.id);
  if (!preferences) {
    return <>{children}</>;
  }

  let suggestion = { show: false as boolean, reasons: [] as string[] };
  try {
    const history = await getWorkoutHistory(session.user.id);
    suggestion = evaluateHeartDoctorSuggestion(history);
  } catch {
    // Mongo or env missing: skip banner
  }

  return (
    <>
      {suggestion.show && (
        <HeartHealthDoctorBanner reasons={suggestion.reasons} />
      )}
      {children}
    </>
  );
}
