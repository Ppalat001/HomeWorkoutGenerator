import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
  MONGODB_DB_NAME,
  WORKOUT_HISTORY_COLLECTION,
} from "@/lib/db-names";
import type {
  AdaptiveLevel,
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
  };
}

export async function getWorkoutHistory(
  userId: string,
  limit = 40
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
}): Promise<void> {
  const client = await clientPromise;
  const db = client.db(MONGODB_DB_NAME);

  await db.collection(WORKOUT_HISTORY_COLLECTION).insertOne({
    userId: new ObjectId(input.userId),
    date: input.date,
    adaptiveLevel: input.adaptiveLevel,
    completionRate: input.completionRate,
    feedback: input.feedback,
    skipped: input.skipped,
  });
}
