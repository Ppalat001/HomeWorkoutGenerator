SMART HOME WORKOUT GENERATOR — QUICK RUN GUIDE

A small web application (Next.js) that runs in a browser on your machine. 
It uses a MongoDB database for user accounts and workout data.

YOU NEED ON YOUR COMPUTER

1. Node.js — install from https://nodejs.org/
   This includes npm, the package installer.

2. MongoDB — either a free cloud database at https://www.mongodb.com/atlas or a
   MongoDB instance you already have. 



STEPS TO RUN IT

1. Open a terminal in the project folder (the same folder that contains package.json).

2. Install dependencies:
      npm install

3. Create a file named ".env.local" in that same folder. Add at least:

      MONGO_URI=<your MongoDB connection string>
      NEXTAUTH_SECRET=<any long random string, e.g. 32+ characters>
      NEXTAUTH_URL=http://localhost:3000

   Replace the placeholder values with real values.

4. Start the application in development mode:
      npm run dev

5. Open a web browser and go to:
      http://localhost:3000

   You should see the application.

6. To stop the server, return to the terminal and press Ctrl+C.

