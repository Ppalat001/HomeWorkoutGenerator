const STORAGE_VERSION = "v1";
const STORAGE_PREFIX = "hwg.disliked-exercises";

export function dislikedExercisesStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}.${STORAGE_VERSION}:${userId}`;
}

export function readDislikedExerciseIds(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(dislikedExercisesStorageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function writeDislikedExerciseIds(userId: string, ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    dislikedExercisesStorageKey(userId),
    JSON.stringify([...ids])
  );
}

export function addDislikedExerciseId(userId: string, exerciseId: string): Set<string> {
  const next = readDislikedExerciseIds(userId);
  next.add(exerciseId);
  writeDislikedExerciseIds(userId, next);
  return next;
}
