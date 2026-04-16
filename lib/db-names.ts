/** MongoDB database `users` with collections used by the app. */
export const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "users";
export const USERS_COLLECTION = process.env.MONGODB_COLLECTION_NAME ?? "users";
export const USER_PREFERENCES_COLLECTION = "user_preferences";
export const WORKOUT_HISTORY_COLLECTION = "workout_history";
