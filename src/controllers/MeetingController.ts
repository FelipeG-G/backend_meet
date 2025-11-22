// src/controllers/MeetingController.ts
import { Response } from "express";
import MeetingDAO from "../dao/MeetingDAO";
import { createMeetingData } from "../models/Meeting";
import { AuthRequest } from "../Middleware/firebaseMiddleware";

/**
 * Controller to manage meeting creation, retrieval, updates, and deletion.
 */
export class MeetingController {
  /**
   * Create a meeting owned by the authenticated user.
   *
   * @param req - Authenticated request containing meeting payload.
   * @param res - Response with persisted meeting data.
   */
  async createMeeting(req: AuthRequest, res: Response) {
    try {
      const hostId = req.userId!;
      const { title, date, time, duration, description } = req.body;

      if (!title || !date || !time || !duration) {
        return res.status(400).json({
          message: "title, date, time and duration are required",
        });
      }

      const meetingData = createMeetingData(
        { title, date, time, duration, description },
        hostId
      );

      const meeting = await MeetingDAO.create(meetingData);

      return res.status(201).json({
        message: "Meeting created successfully",
        meeting,
      });
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * List meetings created by the authenticated user.
   *
   * @param req - Authenticated request with `userId`.
   * @param res - Response containing meetings list.
   */
  async getUserMeetings(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      const meetings = await MeetingDAO.getByHostId(userId);

      return res.json(meetings);
    } catch (error: any) {
      console.error("Error getting meetings:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Retrieve a meeting by id.
   *
   * @param req - Authenticated request with route param `id`.
   * @param res - Response with meeting data or a 404 message.
   */
  async getMeetingById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const meeting = await MeetingDAO.getById(id);

      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      return res.json(meeting);
    } catch (error: any) {
      console.error("Error getting meeting:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Update a meeting document with provided fields.
   *
   * @param req - Authenticated request with route param `id` and body changes.
   * @param res - Response confirming update.
   */
  async updateMeeting(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await MeetingDAO.update(id, req.body);

      return res.json({ message: "Meeting updated successfully" });
    } catch (error: any) {
      console.error("Error updating meeting:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Delete a meeting by id.
   *
   * @param req - Authenticated request with route param `id`.
   * @param res - Response confirming deletion.
   */
  async deleteMeeting(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await MeetingDAO.delete(id);

      return res.json({ message: "Meeting deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting meeting:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}

const meetingController = new MeetingController();
export default meetingController;
