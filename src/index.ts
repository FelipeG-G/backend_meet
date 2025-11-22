/**
 * Main entry point for the Express server.
 * Configures environment variables, Firebase connection, global middleware, and route mounting.
 */

// Load environment variables before any other imports
import "./config/env";

import express from "express";
import cors from "cors";
import { connectFirebase } from "./config/firebase";

import routes from "./routes/routes";
import userRoutes from "./routes/userRoutes";
import meetingRoutes from "./routes/meetingRoutes";

/**
 * Main Express application instance.
 */
const app = express();

/**
 * Middleware to parse incoming JSON requests.
 */
app.use(express.json());

/**
 * Whitelisted origins allowed for CORS requests.
 */
const allowedOrigins = [
  "http://localhost:5173",
  "https://plataforma-de-video-conferencias.vercel.app",
];

/**
 * CORS configuration that restricts origins to the whitelist.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/**
 * Establish Firebase connection once on startup.
 */
connectFirebase();

/**
 * Mount base routes.
 * Prefix: `/api/v1`
 */
app.use("/api/v1", routes);

/**
 * Mount user routes directly for compatibility.
 * Prefix: `/api/v1/users`
 */
app.use("/api/v1/users", userRoutes);

/**
 * Mount meeting routes directly for compatibility.
 * Prefix: `/api/v1/meetings`
 */
app.use("/api/v1/meetings", meetingRoutes);

/**
 * Health check endpoint.
 */
app.get("/", (req, res) => res.send("Server is running"));

/**
 * Start the HTTP server when executed directly.
 */
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
