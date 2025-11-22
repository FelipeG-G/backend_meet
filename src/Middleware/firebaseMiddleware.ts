// src/middleware/firebaseAuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";

/**
 * Express request extended with Firebase user id injected by the auth middleware.
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Verify Firebase ID tokens and attach the user id to the request.
 *
 * Expects an `Authorization: Bearer <token>` header. Rejects requests
 * with missing/invalid tokens with a 401 response.
 */
export const firebaseAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = await firebaseAuth().verifyIdToken(token);

    // Firebase returns uid, not a numeric id.
    req.userId = decoded.uid;

    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
