import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

// Default matches your Atlas screenshot: database `users`, collection `users`.
const DB_NAME = process.env.MONGODB_DB_NAME ?? "users";
const COLLECTION = process.env.MONGODB_COLLECTION_NAME ?? "users";

export type AppUser = {
  _id?: string;
  name?: string;
  email: string;
  password: string;
  createdAt?: Date;
};

export async function findUserByEmail(email: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  return db.collection(COLLECTION).findOne({ email: email.toLowerCase() });
}

export async function createUser({
  name,
  email,
  password,
}: {
  name?: string;
  email: string;
  password: string;
}) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const existingUser = await db
    .collection(COLLECTION)
    .findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.collection(COLLECTION).insertOne({
    name: name?.trim() || "",
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date(),
  });

  return result;
}

export async function validateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) return null;

  return {
    id: user._id.toString(),
    name: user.name || "",
    email: user.email,
  };
}