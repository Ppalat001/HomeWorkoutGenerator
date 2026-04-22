import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
  MONGODB_DB_NAME,
  USER_PREFERENCES_COLLECTION,
} from "@/lib/db-names";
import type { AdaptiveLevel, UserPreferences } from "@/lib/workout-types";

type UserPreferencesDocument = {
  _id: ObjectId;
  userId: ObjectId;
  goal: string;
  fitnessLevel: AdaptiveLevel;
  trainingDaysPerWeek: number;
  manualTrainingDaysPerWeek?: number;
  sessionIncreasePromptNever?: boolean;
  sessionIncreasePromptEveryDays?: number;
  sessionIncreasePromptNextAt?: Date | null;
  levelIncreasePromptNever?: boolean;
  levelIncreasePromptEveryDays?: number;
  levelIncreasePromptNextAt?: Date | null;
  preferredTrainingDays: string[];
  workoutDurationMinutes: number;
  preferredExerciseTypes: string[];
  limitations: string;
  wantsLowImpact: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function mapDoc(doc: UserPreferencesDocument): UserPreferences {
  return {
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    goal: doc.goal,
    fitnessLevel: doc.fitnessLevel,
    trainingDaysPerWeek: doc.trainingDaysPerWeek,
    manualTrainingDaysPerWeek: doc.manualTrainingDaysPerWeek,
    sessionIncreasePromptNever: doc.sessionIncreasePromptNever,
    sessionIncreasePromptEveryDays: doc.sessionIncreasePromptEveryDays,
    sessionIncreasePromptNextAt: doc.sessionIncreasePromptNextAt ?? null,
    levelIncreasePromptNever: doc.levelIncreasePromptNever,
    levelIncreasePromptEveryDays: doc.levelIncreasePromptEveryDays,
    levelIncreasePromptNextAt: doc.levelIncreasePromptNextAt ?? null,
    preferredTrainingDays: doc.preferredTrainingDays,
    workoutDurationMinutes: doc.workoutDurationMinutes,
    preferredExerciseTypes: doc.preferredExerciseTypes,
    limitations: doc.limitations,
    wantsLowImpact: doc.wantsLowImpact,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const client = await clientPromise;
  const db = client.db(MONGODB_DB_NAME);
  const doc = await db
    .collection<UserPreferencesDocument>(USER_PREFERENCES_COLLECTION)
    .findOne({ userId: new ObjectId(userId) });

  if (!doc) return null;
  return mapDoc(doc);
}

export type PreferencesInput = Omit<
  UserPreferences,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

export async function createUserPreferences(
  userId: string,
  input: PreferencesInput
): Promise<void> {
  const client = await clientPromise;
  const db = client.db(MONGODB_DB_NAME);
  const now = new Date();

  const existing = await db
    .collection(USER_PREFERENCES_COLLECTION)
    .findOne({ userId: new ObjectId(userId) });

  if (existing) {
    throw new Error("Preferences already exist");
  }

  await db.collection(USER_PREFERENCES_COLLECTION).insertOne({
    userId: new ObjectId(userId),
    goal: input.goal,
    fitnessLevel: input.fitnessLevel,
    trainingDaysPerWeek: input.trainingDaysPerWeek,
    manualTrainingDaysPerWeek: input.manualTrainingDaysPerWeek,
    sessionIncreasePromptNever: input.sessionIncreasePromptNever ?? false,
    sessionIncreasePromptEveryDays: input.sessionIncreasePromptEveryDays ?? 7,
    sessionIncreasePromptNextAt: input.sessionIncreasePromptNextAt ?? null,
    levelIncreasePromptNever: input.levelIncreasePromptNever ?? false,
    levelIncreasePromptEveryDays: input.levelIncreasePromptEveryDays ?? 7,
    levelIncreasePromptNextAt: input.levelIncreasePromptNextAt ?? null,
    preferredTrainingDays: input.preferredTrainingDays,
    workoutDurationMinutes: input.workoutDurationMinutes,
    preferredExerciseTypes: input.preferredExerciseTypes,
    limitations: input.limitations,
    wantsLowImpact: input.wantsLowImpact,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateUserFitnessLevel(
  userId: string,
  fitnessLevel: AdaptiveLevel
): Promise<{ matchedCount: number }> {
  return updateUserPreferencesPatch(userId, { fitnessLevel });
}

export async function updateUserPreferencesPatch(
  userId: string,
  patch: {
    fitnessLevel?: AdaptiveLevel;
    manualTrainingDaysPerWeek?: number;
    sessionIncreasePromptNever?: boolean;
    sessionIncreasePromptEveryDays?: number;
    sessionIncreasePromptNextAt?: Date | null;
    levelIncreasePromptNever?: boolean;
    levelIncreasePromptEveryDays?: number;
    levelIncreasePromptNextAt?: Date | null;
  }
): Promise<{ matchedCount: number }> {
  const client = await clientPromise;
  const db = client.db(MONGODB_DB_NAME);
  const setDoc: {
    fitnessLevel?: AdaptiveLevel;
    manualTrainingDaysPerWeek?: number;
    sessionIncreasePromptNever?: boolean;
    sessionIncreasePromptEveryDays?: number;
    sessionIncreasePromptNextAt?: Date | null;
    levelIncreasePromptNever?: boolean;
    levelIncreasePromptEveryDays?: number;
    levelIncreasePromptNextAt?: Date | null;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };
  if (patch.fitnessLevel) {
    setDoc.fitnessLevel = patch.fitnessLevel;
  }
  if (typeof patch.manualTrainingDaysPerWeek === "number") {
    setDoc.manualTrainingDaysPerWeek = patch.manualTrainingDaysPerWeek;
  }
  if (typeof patch.sessionIncreasePromptNever === "boolean") {
    setDoc.sessionIncreasePromptNever = patch.sessionIncreasePromptNever;
  }
  if (typeof patch.sessionIncreasePromptEveryDays === "number") {
    setDoc.sessionIncreasePromptEveryDays = patch.sessionIncreasePromptEveryDays;
  }
  if (
    patch.sessionIncreasePromptNextAt === null ||
    patch.sessionIncreasePromptNextAt instanceof Date
  ) {
    setDoc.sessionIncreasePromptNextAt = patch.sessionIncreasePromptNextAt;
  }
  if (typeof patch.levelIncreasePromptNever === "boolean") {
    setDoc.levelIncreasePromptNever = patch.levelIncreasePromptNever;
  }
  if (typeof patch.levelIncreasePromptEveryDays === "number") {
    setDoc.levelIncreasePromptEveryDays = patch.levelIncreasePromptEveryDays;
  }
  if (
    patch.levelIncreasePromptNextAt === null ||
    patch.levelIncreasePromptNextAt instanceof Date
  ) {
    setDoc.levelIncreasePromptNextAt = patch.levelIncreasePromptNextAt;
  }
  const result = await db.collection(USER_PREFERENCES_COLLECTION).updateOne(
    { userId: new ObjectId(userId) },
    { $set: setDoc }
  );
  return { matchedCount: result.matchedCount };
}
