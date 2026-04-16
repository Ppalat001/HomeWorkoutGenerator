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
    preferredTrainingDays: input.preferredTrainingDays,
    workoutDurationMinutes: input.workoutDurationMinutes,
    preferredExerciseTypes: input.preferredExerciseTypes,
    limitations: input.limitations,
    wantsLowImpact: input.wantsLowImpact,
    createdAt: now,
    updatedAt: now,
  });
}
