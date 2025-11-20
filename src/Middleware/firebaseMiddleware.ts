// src/middleware/firebaseAuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";

export interface AuthRequest extends Request {
  userId?: string;
}

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

    // Firebase retorna uid, no id
    req.userId = decoded.uid;

    next();
  } catch (error) {
    console.error("🔥 Error verificando token Firebase:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
