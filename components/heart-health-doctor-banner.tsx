type Props = {
  reasons: string[];
};

export default function HeartHealthDoctorBanner({ reasons }: Props) {
  if (reasons.length === 0) return null;

  return (
    <div
      className="border-b border-rose-400/40 bg-rose-950/50 px-6 py-4 text-rose-50 backdrop-blur-md"
      role="alert"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-rose-100">
          Heart rate pattern — consider a medical check-in
        </p>
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
