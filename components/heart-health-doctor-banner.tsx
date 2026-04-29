"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";

type Props = {
  reasons: string[];
};

export default function HeartHealthDoctorBanner({ reasons }: Props) {
  const [hidden, setHidden] = useState(false);

  const dismiss = useCallback(() => {
    setHidden(true);
  }, []);

  if (reasons.length === 0 || hidden) return null;

  return (
    <div
      className="border-b-2 border-amber-400/70 bg-gradient-to-b from-amber-900/95 via-amber-950/98 to-[#1a0a02] px-6 py-4 text-amber-50 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md"
      role="alert"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold tracking-tight text-amber-50">
              Heart rate pattern — please read
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-snug text-amber-100">
              {reasons.map((r, i) => (
                <li key={i} className="pl-0.5 marker:text-amber-400">
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-medium leading-relaxed text-amber-200/95">
              This app is not a medical device. If you have chest pain, fainting,
              or severe shortness of breath, seek urgent care.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg border-2 border-amber-300/60 bg-amber-800/60 p-2 text-amber-50 shadow-sm transition hover:border-amber-200 hover:bg-amber-700/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
            aria-label="Close this message"
            title="Close (shows again on refresh)"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
