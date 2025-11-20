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
    return res.status(400).json({
      message: "Login must be handled from client using Firebase Auth."
    });
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const id = req.userId!;
      const user = await UserDAO.findById(id);

      if (!user) return res.status(404).json({ message: "User not found" });

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
