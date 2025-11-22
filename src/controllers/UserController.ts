// src/controllers/UserController.ts
import { Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";
import UserDAO from "../dao/UserDAO";
import { createUserData } from "../models/User";
import { AuthRequest } from "../Middleware/firebaseMiddleware";

class UserController {
  async registerUser(req: Request, res: Response) {
    try {
      const { email, password, username, lastname, birthdate } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const userRecord = await firebaseAuth().createUser({ email, password });

      const userData = createUserData(
        { email, username, lastname, birthdate },
        userRecord.uid
      );

      await UserDAO.create(userRecord.uid, userData);

      return res.status(201).json({
        message: "Usuario registrado con exito",
        user: userData,
      });
    } catch (error: any) {
      console.error("Error en registerUser:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const apiKey = process.env.FIREBASE_WEB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Missing FIREBASE_WEB_API_KEY" });
      }

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload?.error?.message === "INVALID_PASSWORD"
            ? "Invalid credentials"
            : payload?.error?.message || "Unable to login with email/password";
        return res.status(401).json({ message });
      }

      const user = await UserDAO.findByEmail(email).catch(() => null);

      return res.json({
        message: "Login successful",
        idToken: payload?.idToken,
        refreshToken: payload?.refreshToken,
        user,
      });
    } catch (error: any) {
      console.error("Error en loginUser:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const id = req.userId!;
      const user = await UserDAO.findById(id);

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json(user);
    } catch (error: any) {
      console.error("Error en getProfile:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      await UserDAO.update(req.userId!, req.body);

      return res.json({ message: "Profile updated" });
    } catch (error: any) {
      console.error("Error en updateProfile:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteProfile(req: AuthRequest, res: Response) {
    try {
      const id = req.userId!;

      await UserDAO.delete(id);
      await firebaseAuth().deleteUser(id);

      return res.json({ message: "User deleted" });
    } catch (error: any) {
      console.error("Error en deleteProfile:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const link = await firebaseAuth().generatePasswordResetLink(email);

      return res.json({
        message: "Reset email sent",
        link,
      });
    } catch (error: any) {
      console.error("Error en requestPasswordReset:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    return res.status(400).json({
      message: "Password reset handled automatically by Firebase email link",
    });
  }
}

export default new UserController();
