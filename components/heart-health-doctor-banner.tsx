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
      className="border-b border-amber-400/15 bg-amber-950/20 px-6 py-3 text-amber-50/95 backdrop-blur-sm"
      role="status"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-amber-100/90">
              Heart rate pattern — gentle reminder
            </p>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-[11px] leading-snug text-amber-100/75">
              {reasons.map((r, i) => (
                <li key={i} className="pl-0.5">
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] leading-relaxed text-amber-200/55">
              Not a medical device. Chest pain, fainting, or severe breathlessness
              — seek urgent care.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-md border border-white/10 bg-white/5 p-1 text-amber-100/70 transition hover:bg-white/10 hover:text-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300/50"
            aria-label="Close this message"
            title="Close (shows again on refresh)"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
