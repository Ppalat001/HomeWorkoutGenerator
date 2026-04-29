import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
  MONGODB_DB_NAME,
  WORKOUT_HISTORY_COLLECTION,
} from "@/lib/db-names";
import type {
  AdaptiveLevel,
  ExerciseHeartRateEntry,
  WorkoutFeedback,
  WorkoutHistoryEntry,
} from "@/lib/workout-types";

type WorkoutHistoryDocument = {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;
  adaptiveLevel: AdaptiveLevel;
  completionRate: number;
  feedback: WorkoutFeedback | null;
  skipped: boolean;
  exerciseHeartRates?: ExerciseHeartRateEntry[];
  trackingStatus?: string;
};

function mapDoc(doc: WorkoutHistoryDocument): WorkoutHistoryEntry {
  return {
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    date: doc.date,
    adaptiveLevel: doc.adaptiveLevel,
    completionRate: doc.completionRate,
    feedback: doc.feedback,
    skipped: doc.skipped,
    exerciseHeartRates: doc.exerciseHeartRates,
    trackingStatus: doc.trackingStatus,
  };
}

export async function getWorkoutHistory(
  userId: string,
  /** Needs enough rows for multi-week streaks (e.g. 6 weeks × several sessions). */
  limit = 200
): Promise<WorkoutHistoryEntry[]> {
  const client = await clientPromise;
  const db = client.db(MONGODB_DB_NAME);
  const docs = await db
    .collection<WorkoutHistoryDocument>(WORKOUT_HISTORY_COLLECTION)
    .find({ userId: new ObjectId(userId) })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();

  return docs.map(mapDoc);
}

export async function addWorkoutHistoryEntry(input: {
  userId: string;
  date: Date;
  adaptiveLevel: AdaptiveLevel;
  completionRate: number;
  feedback: WorkoutFeedback | null;
  skipped: boolean;
  exerciseHeartRates?: ExerciseHeartRateEntry[];
}): Promise<void> {
  const client = await clientPromise;
  const db = client.db(MONGODB_DB_NAME);

  const doc: Record<string, unknown> = {
    userId: new ObjectId(input.userId),
    date: input.date,
    adaptiveLevel: input.adaptiveLevel,
    completionRate: input.completionRate,
    feedback: input.feedback,
    skipped: input.skipped,
  };
  if (input.exerciseHeartRates && input.exerciseHeartRates.length > 0) {
    doc.exerciseHeartRates = input.exerciseHeartRates;
  }

  await db.collection(WORKOUT_HISTORY_COLLECTION).insertOne(doc);
}
