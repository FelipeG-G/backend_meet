// src/config/firebase.ts
import admin from "firebase-admin";
import path from "path";

let appInitialized = false;

// Cargar credenciales JSON
const serviceAccount = require(path.resolve(__dirname, "../../serviceAccountKey.json"));

export const connectFirebase = () => {
  if (appInitialized) return;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: "https://plataforma-meet-ffed5.firebaseio.com",
  });

  appInitialized = true;

  console.log("🔥 Firebase inicializado correctamente");
};

// ====== EXPORTAMOS FUNCIONES QUE SIEMPRE LEEN EL APP INICIALIZADO ======

export const firebaseDB = () => admin.firestore();
export const firebaseAuth = () => admin.auth();
export const firebaseStorage = () => admin.storage();
