// src/controllers/UserController.ts
import { Request, Response } from "express";
import sgMail from "@sendgrid/mail";
import { firebaseAuth } from "../config/firebase";
import UserDAO from "../dao/UserDAO";
import { createUserData } from "../models/User";
import { AuthRequest } from "../Middleware/firebaseMiddleware";

// Normalize SendGrid env values.
const SENDGRID_API_KEY = (process.env.SENDGRID_API_KEY || "").trim();
const SENDGRID_FROM = (process.env.SENDGRID_FROM || "").trim();

// Configure SendGrid once on import if configuration is present.
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Send a password reset email using SendGrid.
 */
const sendPasswordResetEmail = async (to: string, username: string, resetLink: string) => {
  const html = `
  <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px;">
    <div style="max-width: 600px; background: white; margin: auto; padding: 20px; border-radius: 12px; border: 1px solid #eee;">
      <h2 style="color: #121212;">Hola ${username || "Usuario"},</h2>
      <p style="font-size: 16px; color: #555;">
        Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}"
           style="
             display: inline-block;
             background: #2b6cb0;
             color: white;
             padding: 14px 22px;
             border-radius: 8px;
             text-decoration: none;
             font-size: 16px;">
          Restablecer contraseña
        </a>
      </div>

      <p style="color: #555;">Si no solicitaste este cambio, simplemente ignora este mensaje.</p>

      <p style="margin-top: 40px; color: #888; font-size: 13px;">
        — Equipo Plataforma Meet
      </p>
    </div>
  </div>
  `;

  const msg = {
    to,
    from: SENDGRID_FROM || "",
    subject: "Restablecer contraseña",
    html,
  };

  await sgMail.send(msg);
};

/**
 * Handles user lifecycle operations backed by Firebase Auth and Firestore.
 */
export class UserController {
  /**
   * Create a Firebase Auth user and persist a profile document.
   *
   * @param req - Request containing `email`, `password`, and optional profile fields.
   * @param res - Response with created user data or validation errors.
   */
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

  /**
   * Authenticate a user through Firebase Auth REST API and return tokens.
   *
   * @param req - Request containing `email` and `password`.
   * @param res - Response with ID/refresh tokens and stored profile.
   */
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

  /**
   * Update the authenticated user's email in Firebase Auth and Firestore.
   *
   * @param req - Authenticated request with new `email`.
   * @param res - Response confirming update or describing validation errors.
   */
  async updateEmail(req: AuthRequest, res: Response) {
    try {
      const { email } = req.body;
      const uid = req.userId!;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "New email is required" });
      }

      await firebaseAuth().updateUser(uid, { email });
      await UserDAO.update(uid, { email });

      return res.json({ message: "Email updated" });
    } catch (error: any) {
      const code = error?.code || error?.errorInfo?.code;
      if (code === "auth/email-already-exists") {
        return res.status(409).json({ message: "Email already in use" });
      }
      if (code === "auth/invalid-email") {
        return res.status(400).json({ message: "Invalid email" });
      }
      console.error("Error en updateEmail:", error);
      return res.status(500).json({ message: error.message || "Unable to update email" });
    }
  }

  /**
   * Retrieve the authenticated user's profile; auto-creates it when missing.
   *
   * @param req - Authenticated request with `userId` set by middleware.
   * @param res - Response with profile data.
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const id = req.userId!;
      const user = await UserDAO.findById(id);

      if (!user) {
        // If the user signed in via a social provider and lacks a document,
        // create a minimal Firestore profile using available Firebase data.
        const userRecord = await firebaseAuth().getUser(id);
        const email = userRecord.email || "";
        const displayName = userRecord.displayName || email.split("@")[0] || "";

        const newUser = createUserData(
          { email, username: displayName, lastname: "", birthdate: "" },
          id
        );

        await UserDAO.create(id, newUser);
        return res.json(newUser);
      }

      return res.json(user);
    } catch (error: any) {
      console.error("Error en getProfile:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Patch the authenticated user's profile document with provided fields.
   *
   * @param req - Authenticated request carrying profile fields.
   * @param res - Response confirming update.
   */
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      await UserDAO.update(req.userId!, req.body);

      return res.json({ message: "Profile updated" });
    } catch (error: any) {
      console.error("Error en updateProfile:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Remove the authenticated user's profile and Firebase Auth account.
   *
   * @param req - Authenticated request with `userId`.
   * @param res - Response confirming deletion.
   */
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

  /**
   * Trigger a Firebase Auth password reset email for the provided address.
   *
   * @param req - Request containing the target `email`.
   * @param res - Response with generated reset link.
   */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!SENDGRID_API_KEY || !SENDGRID_FROM) {
        return res.status(500).json({ message: "Missing SendGrid configuration" });
      }

      const user = await UserDAO.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const link = await firebaseAuth().generatePasswordResetLink(email);

      await sendPasswordResetEmail(email, user.username, link);

      return res.json({
        message: "Reset email sent successfully",
      });
    } catch (error: any) {
      console.error("Error en requestPasswordReset:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Inform clients that password reset flow is handled via Firebase email link.
   *
   * @param req - Request (unused).
   * @param res - Response with guidance message.
   */
  async resetPassword(req: Request, res: Response) {
    return res.status(400).json({
      message: "Password reset handled automatically by Firebase email link",
    });
  }
}

const userController = new UserController();
export default userController;
