# Smart Home Workout Generator

Next.js app for generating home workouts, with MongoDB-backed users and NextAuth (credentials) sign-in.

## What you need installed

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | **20 LTS** or **22 LTS** (use a current LTS; this project uses Next.js 16 and React 19) |
| [npm](https://docs.npmjs.com/cli/) | Comes with Node.js (lockfile is npm v9+ / `lockfileVersion: 3`) |
| [Git](https://git-scm.com/) | Any recent version, to clone the repository |

Optional but typical for this stack:

- A **MongoDB** database you can reach over the network ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works). The app reads a connection string from environment variables.

You do **not** need a global install of Next.js or TypeScript; they are project dependencies.

## Project stack (for reference)

- **Next.js** 16.x  
- **React** 19.x  
- **TypeScript** 5.x  
- **MongoDB** driver 7.x  
- **NextAuth.js** 4.x (credentials provider)  
- **Tailwind CSS** 4.x  

Exact versions are pinned in `package.json` / `package-lock.json`.

## Run locally

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd HomeWorkoutGenerator
npm install
```

Use `npm ci` instead of `npm install` if you want a clean install strictly from the lockfile (common in CI or when reproducing exact dependency trees).

### 2. Environment variables

Create a file named **`.env.local`** in the project root (same folder as `package.json`). This file is gitignored and holds your local secrets.

**Required**

```env
# MongoDB connection (either name works)
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/?appName=...

# NextAuth signing secret — use a long random string in production
# Example (Git Bash / macOS / Linux): openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here

# Base URL of the app (use this for local dev)
NEXTAUTH_URL=http://localhost:3000
```

**Optional** (defaults are shown)

```env
MONGODB_DB_NAME=users
MONGODB_COLLECTION_NAME=users
```

If `MONGO_URI` / `MONGODB_URI` is missing, the app throws at startup when the database module loads.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev script increases Node’s memory limit for the Next.js dev server.

### 4. Production-style run (optional)

```bash
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000) (Next.js defaults to port 3000 unless you set `PORT`).

## Other npm scripts

| Command | Purpose |
|---------|---------|
| `npm run lint` | Run ESLint |
| `npm run seed:history -- <24HexUserObjectId>` | Seed six weeks of workout history into `workout_history` (needs `.env.local` with `MONGO_URI`) |
| `npm run seed:history:json` | Write mock data to `data/mock-workout-history-6-weeks.json` (no MongoDB write) |

## Troubleshooting

- **“Missing MONGO_URI (or MONGODB_URI) in .env.local”** — Add the variable to `.env.local` and restart the dev server.  
- **Wrong Node version** — Install Node 20 or 22 LTS, then reinstall dependencies (`rm -rf node_modules` and `npm install` on Unix; on Windows delete `node_modules` and run `npm install`).  
- **Port 3000 in use** — Stop the other process or run with another port, e.g. `npx next dev -p 3001` (you would then set `NEXTAUTH_URL` to match).

## Learn more

- [Next.js documentation](https://nextjs.org/docs)  
- [NextAuth.js documentation](https://next-auth.js.org/)
