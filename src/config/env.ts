// src/config/env.ts
// Centralized loader to ensure environment variables are available
// before other modules import them.
import dotenv from "dotenv";

dotenv.config();
