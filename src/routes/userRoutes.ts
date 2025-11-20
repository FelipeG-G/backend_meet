// src/routes/userRoutes.ts
import { Router, Request, Response } from "express";
import UserController from "../controllers/UserController";
import { firebaseAuthMiddleware } from "../Middleware/firebaseMiddleware";

const router = Router();

// Public
router.post("/register", (req, res) => UserController.registerUser(req, res));
router.post("/login", (req, res) => UserController.loginUser(req, res));
router.post("/request-password-reset", (req, res) =>
  UserController.requestPasswordReset(req, res)
);
router.post("/reset-password", (req, res) =>
  UserController.resetPassword(req, res)
);

// Protected
router.get("/profile", firebaseAuthMiddleware, (req, res) =>
  UserController.getProfile(req, res)
);

router.put("/profile", firebaseAuthMiddleware, (req, res) =>
  UserController.updateProfile(req, res)
);

router.delete("/profile", firebaseAuthMiddleware, (req, res) =>
  UserController.deleteProfile(req, res)
);

export default router;
