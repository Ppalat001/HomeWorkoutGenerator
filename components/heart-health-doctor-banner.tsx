"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "hwHeartDoctorBannerDismissed";

function dismissToken(userId: string, sessionExpires: string) {
  return `${userId}|${sessionExpires}`;
}

type Props = {
  reasons: string[];
  userId: string;
  sessionExpires: string;
};

export default function HeartHealthDoctorBanner({
  reasons,
  userId,
  sessionExpires,
}: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && stored === dismissToken(userId, sessionExpires)) {
        setHidden(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [userId, sessionExpires]);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        dismissToken(userId, sessionExpires)
      );
    } catch {
      // ignore
    }
    setHidden(true);
  }, [userId, sessionExpires]);

  if (reasons.length === 0 || hidden) return null;

  return (
    <div
      className="border-b border-rose-400/40 bg-rose-950/50 px-6 py-4 text-rose-50 backdrop-blur-md"
      role="alert"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold text-rose-100">
            Heart rate pattern — consider a medical check-in
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg border border-rose-300/40 bg-rose-900/40 p-1.5 text-rose-100 transition hover:bg-rose-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
            aria-label="Dismiss notification until next login"
            title="Dismiss until you sign in again"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-rose-100/95">
          {reasons.map((r, i) => (
            <li key={i} className="pl-1">
              {r}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-rose-200/80">
          This app is not a medical device. If you have chest pain, fainting, or
          unusual shortness of breath, seek urgent care.
        </p>
      </div>
    </div>
  );
}
