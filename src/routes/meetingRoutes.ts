// src/routes/meetingRoutes.ts
import { Router } from "express";
import MeetingController from "../controllers/MeetingController";
import { firebaseAuthMiddleware } from "../Middleware/firebaseMiddleware";

const router = Router();

/**
 * Meeting routes. All endpoints require Firebase authentication.
 */
router.post("/", firebaseAuthMiddleware, (req, res) =>
  MeetingController.createMeeting(req, res)
);

router.get("/", firebaseAuthMiddleware, (req, res) =>
  MeetingController.getUserMeetings(req, res)
);

router.get("/:id", firebaseAuthMiddleware, (req, res) =>
  MeetingController.getMeetingById(req, res)
);

router.put("/:id", firebaseAuthMiddleware, (req, res) =>
  MeetingController.updateMeeting(req, res)
);

router.delete("/:id", firebaseAuthMiddleware, (req, res) =>
  MeetingController.deleteMeeting(req, res)
);

export default router;
