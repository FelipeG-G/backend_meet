// src/controllers/PasswordController.ts

import { Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";

class PasswordController {
  /**
   * @route POST /request-password-reset
   * Firebase envía automáticamente el correo al usuario.
   * También devolvemos el link para pruebas con Postman/frontend.
   */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      // Firebase genera el enlace automáticamente
      const resetLink = await firebaseAuth().generatePasswordResetLink(email);

      return res.status(200).json({
        message: "Password reset email sent",
        resetLink, // útil para Postman / pruebas
      });
    } catch (error: any) {
      console.error("🔥 Error en requestPasswordReset:", error);
      return res.status(500).json({
        message: error.message || "Server error",
      });
    }
  }

  /**
   * @route POST /reset-password
   * Este endpoint NO es necesario en Firebase.
   * El usuario cambia la contraseña directamente desde el email.
   */
  async resetPassword(req: Request, res: Response) {
    return res.status(400).json({
      message:
        "Password reset is handled automatically by Firebase via email link.",
    });
  }
}

export default new PasswordController();
