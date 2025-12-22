import serverless from "serverless-http";
import app from "../server.js"; // Import your existing Express app

export const handler = serverless(app);
