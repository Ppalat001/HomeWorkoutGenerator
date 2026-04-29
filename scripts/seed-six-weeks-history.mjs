/**
 * Seeds `workout_history` with 24 sessions over 6 weeks (>90% completion)
 * and per-exercise heart-rate samples.
 *
 * Usage:
 *   node scripts/seed-six-weeks-history.mjs --emit-json
 *       Writes data/mock-workout-history-6-weeks.json (no mongodb package required).
 *   node scripts/seed-six-weeks-history.mjs <mongoUserObjectId>
 *       Inserts into MongoDB (requires `mongodb` in node_modules).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const EXERCISE_NAMES = {
  "wall-push-up": "Wall push-up",
  "bodyweight-squat": "Bodyweight squat",
  "glute-bridge": "Glute bridge",
  "basic-crunch": "Basic crunch",
  "marching-in-place": "Marching in place",
  "standing-calf-raise": "Standing calf raise",
  "arm-circles": "Arm circles",
  "standard-push-up": "Standard push-up",
  "forward-lunge": "Forward lunge",
  "bicycle-crunch": "Bicycle crunch",
  "jumping-jacks": "Jumping jacks",
  "dumbbell-row": "Bent-over row",
  "high-knees": "High knees",
  plank: "Forearm plank",
  "explosive-push-up": "Explosive push-up",
  "jump-squat": "Jump squat",
  "pull-up": "Pull-up",
  burpee: "Burpee",
  "v-sit-hold": "V-sit hold",
  "dynamic-stretch-flow": "Dynamic stretch flow",
  "chair-squat": "Chair squat",
  "kneeling-push-up": "Kneeling push-up",
  "bird-dog": "Bird dog",
  "side-lying-leg-lift": "Side-lying leg lift",
  "toe-taps": "Toe taps",
  "wall-sit": "Wall sit",
  "superman-hold": "Superman hold",
  "standing-hamstring-curl": "Standing hamstring curl",
  "reverse-lunge": "Reverse lunge",
  "mountain-climber": "Mountain climber",
  "russian-twist": "Russian twist",
  inchworm: "Inchworm",
  "chair-tricep-dip": "Chair tricep dip",
  "lateral-lunge": "Lateral lunge",
  "dead-bug": "Dead bug",
  "pike-push-up": "Pike push-up",
  "squat-pulse": "Squat pulse",
  "decline-push-up": "Decline push-up",
  "tuck-jump": "Tuck jump",
  "single-leg-romanian-deadlift": "Single-leg Romanian deadlift (bodyweight)",
  "hand-release-push-up": "Hand-release push-up",
  "archer-push-up": "Archer push-up",
  "bear-crawl": "Bear crawl",
  "jump-lunge": "Jump lunge",
  "hollow-rock": "Hollow body rock",
  "diamond-push-up": "Diamond push-up",
};

const SESSION_EXERCISES = [
  ["bodyweight-squat", "wall-push-up", "marching-in-place"],
  ["forward-lunge", "plank", "basic-crunch"],
  ["jumping-jacks", "high-knees", "glute-bridge"],
  ["standard-push-up", "bicycle-crunch", "standing-calf-raise"],
  ["bodyweight-squat", "dumbbell-row", "arm-circles"],
  ["jump-squat", "burpee", "v-sit-hold"],
  ["pull-up", "explosive-push-up", "dynamic-stretch-flow"],
  ["forward-lunge", "marching-in-place", "basic-crunch"],
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function bpmSeriesFor(exerciseId, sessionIndex) {
  const h = hashString(exerciseId) + sessionIndex * 41;
  const base = 94 + (h % 22);
  const len = 16;
  const out = [];
  for (let i = 0; i < len; i++) {
    const wave = Math.sin(i / 2.3 + sessionIndex * 0.15) * 14;
    const ramp = (i / len) * 6;
    const noise = ((h + i * 19) % 7) - 3;
    out.push(Math.round(base + wave + ramp + noise));
  }
  return out;
}

function mondayStartWeeksAgo(weeks) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - weeks * 7);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/** @returns {object[]} JSON-serializable documents (ISO dates, string userId placeholder) */
function buildSixWeekHistoryPlainDocs(userIdPlaceholder) {
  const monday = mondayStartWeeksAgo(6);
  const docs = [];
  let sessionIndex = 0;

  for (let w = 0; w < 6; w++) {
    for (const dow of [0, 2, 4, 6]) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + w * 7 + dow);
      const pool = SESSION_EXERCISES[sessionIndex % SESSION_EXERCISES.length];
      sessionIndex += 1;

      const exerciseHeartRates = pool.map((exerciseId) => {
        const bpmSeries = bpmSeriesFor(exerciseId, sessionIndex);
        const avgBpm = Math.round(
          bpmSeries.reduce((a, b) => a + b, 0) / bpmSeries.length
        );
        const maxBpm = Math.max(...bpmSeries);
        return {
          exerciseId,
          exerciseName: EXERCISE_NAMES[exerciseId] ?? exerciseId,
          avgBpm,
          maxBpm,
          bpmSeries,
        };
      });

      const completionRate =
        Math.round((0.91 + ((sessionIndex * 3) % 9) * 0.01) * 100) / 100;
      const feedbacks = ["ok", "ok", "easy", "ok", "hard"];
      const feedback = feedbacks[sessionIndex % feedbacks.length];

      docs.push({
        userId: userIdPlaceholder,
        date: date.toISOString(),
        adaptiveLevel: "intermediate",
        completionRate,
        feedback,
        skipped: false,
        exerciseHeartRates,
      });
    }
  }

  return docs;
}

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  const emitJson = argv.includes("--emit-json");
  const userArg = argv.find((a) => !a.startsWith("--"));

  const PLACEHOLDER = "__REPLACE_WITH_YOUR_USER_OBJECT_ID__";
  const plain = buildSixWeekHistoryPlainDocs(PLACEHOLDER);

  if (emitJson) {
    const outPath = path.join(ROOT, "data", "mock-workout-history-6-weeks.json");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(plain, null, 2), "utf8");
    console.log(`Wrote ${plain.length} documents to ${outPath}`);
    console.log(
      `Replace "${PLACEHOLDER}" with your user _id (24 hex chars) before Mongo import, or run:`
    );
    console.log(`  node scripts/seed-six-weeks-history.mjs <yourUserObjectId>`);
    return;
  }

  if (!userArg || !/^[a-f0-9]{24}$/i.test(userArg)) {
    console.error(
      "Provide a 24-character Mongo user ObjectId hex, or use --emit-json."
    );
    process.exit(1);
  }

  let MongoClient;
  let ObjectId;
  try {
    const m = await import("mongodb");
    MongoClient = m.MongoClient;
    ObjectId = m.ObjectId;
  } catch {
    console.error(
      "Could not load `mongodb`. Run `npm install` in the project root, then retry."
    );
    process.exit(1);
  }

  const env = { ...process.env, ...loadEnvLocal() };
  const uri = env.MONGO_URI || env.MONGODB_URI;
  const dbName = env.MONGODB_DB_NAME || "users";
  if (!uri) {
    console.error("Missing MONGO_URI (or MONGODB_URI) in .env.local");
    process.exit(1);
  }

  const oid = new ObjectId(userArg);
  const toInsert = plain.map((d) => ({
    userId: oid,
    date: new Date(d.date),
    adaptiveLevel: d.adaptiveLevel,
    completionRate: d.completionRate,
    feedback: d.feedback,
    skipped: d.skipped,
    exerciseHeartRates: d.exerciseHeartRates,
  }));

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const res = await client
      .db(dbName)
      .collection("workout_history")
      .insertMany(toInsert);
    console.log(`Inserted ${res.insertedCount} documents into ${dbName}.workout_history`);
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
