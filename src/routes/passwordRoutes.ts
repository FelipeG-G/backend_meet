import { Router, Request, Response } from "express";
import PasswordController from "../controllers/PasswordController";

const router = Router();

/**
 * @route POST /password/forgot-password
 * @description Send password reset email
 * @access Public
 */
router.post("/forgot-password", (req: Request, res: Response) => {
  PasswordController.forgotPassword(req, res);
});

/**
 * @route POST /password/reset-password/:token
 * @description Reset user password using token
 * @access Public
 */
router.post("/reset-password/:token", (req: Request, res: Response) => {
  PasswordController.resetPassword(req, res);
});

export default router;
