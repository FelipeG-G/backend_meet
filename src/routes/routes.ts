import { Router } from "express";

import userRoutes from "./userRoutes";
import meetingRoutes from "./meetingRoutes";

const router = Router();

/**
 * Register domain-specific route modules.
 *
 * All routes below are mounted from `src/index.ts` under `/api/v1`.
 */
router.use("/users", userRoutes);
router.use("/meetings", meetingRoutes);

export default router;
