/**
 * @file index.ts
 * @description Main entry point for the Express server. 
 * Configures environment variables, database connection, 
 * global middlewares, CORS handling, and route mounting.
 * 
 * @module Server
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Enables CORS to allow frontend requests
import { connectFirebase } from "./config/firebase"; // firebase connection

import routes from "./routes/routes"; // General API routes
import userRoutes from "./routes/userRoutes"; // User management routes
import meetingRoutes from "./routes/meetingRoutes";

dotenv.config(); // Load environment variables from .env file

/** 
 * Main Express application instance.
 * @type {import('express').Application}
 */
const app = express();

/* ==========================
   🧩 GLOBAL MIDDLEWARES
   ========================== */

/**
 * Middleware to parse incoming JSON requests.
 * Allows Express to handle JSON data in request bodies.
 */
app.use(express.json());

/**
 * Whitelisted origins allowed for CORS requests.
 * Includes development and production environments (Vercel, Render, Localhost).
 * @type {string[]}
 */
const allowedOrigins = [
  "http://localhost:5173",
  "https://plataforma-de-video-conferencias.vercel.app/"
];

/**
 * CORS Middleware.
 * Only allows requests from the origins defined in allowedOrigins.
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

/* ==========================
   🧭 MAIN ROUTES
   ========================== */



/**
 * Establish MongoDB connection.
 * Executed when the server starts.
 * @function connectDB
 */
connectFirebase();

/**
 * General API routes.
 * Prefix: `/api/v1`
 */
app.use("/api/v1", routes);

/**
 * User management routes.
 * Prefix: `/api/v1/users`
 */
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/meetings", meetingRoutes);


/**
 * @route GET /
 * @description Health check endpoint. 
 * Verifies that the server is running correctly.
 * @returns {string} A confirmation message.
 */
app.get("/", (req, res) => res.send("Server is running"));

/**
 * Starts the server only if this file is executed directly.
 * Skipped when running unit tests or importing the module.
 */
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}


export default app;
