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

      // Crear usuario en Firebase Auth
      const userRecord = await firebaseAuth().createUser({ email, password });

      // Datos que se guardan en Firestore
      const userData = createUserData(
        { email, username, lastname, birthdate },
        userRecord.uid
      );

      await UserDAO.create(userRecord.uid, userData);

      return res.status(201).json({
        message: "Usuario registrado con éxito",
        user: userData,
      });

    } catch (error: any) {
      console.error("🔥 Error en registerUser:", error);
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

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const id = req.userId!;
      const user = await UserDAO.findById(id);

      if (!user) {
        // Si el usuario proviene de un proveedor social y aún no tiene documento,
        // lo creamos en Firestore con los datos básicos que tenga Firebase.
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
      console.error("🔥 Error en getProfile:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      await UserDAO.update(req.userId!, req.body);

      return res.json({ message: "Profile updated" });

    } catch (error: any) {
      console.error("🔥 Error en updateProfile:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteProfile(req: AuthRequest, res: Response) {
    try {
      const id = req.userId!;

      await UserDAO.delete(id);               // borra de Firestore
      await firebaseAuth().deleteUser(id);    // borra de Firebase Auth

      return res.json({ message: "User deleted" });

    } catch (error: any) {
      console.error("🔥 Error en deleteProfile:", error);
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
      console.error("🔥 Error en requestPasswordReset:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    return res.status(400).json({
      message: "Password reset handled automatically by Firebase email link"
    });
  }
}

export default new UserController();
