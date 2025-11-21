/**
 * @interface IMeeting
 * @description Represents a meeting created by a user.
 */
export interface IMeeting {
  id: string;            // Firestore document ID
  ownerId: string;       // UID del usuario creador
  title: string;         // Título de la reunión
  description?: string;  // Opcional
  date: string;          // Fecha YYYY-MM-DD
  time: string;          // Hora HH:mm
  duration: number;      // En minutos
  createdAt: string;
  updatedAt: string;
}

/**
 * @function createMeetingData
 * @description Builds a complete meeting object before storing in Firestore.
 */
export const createMeetingData = (
  data: Partial<IMeeting>,
  ownerId: string
): IMeeting => {
  const now = new Date().toISOString();

  return {
    id: "", // Se rellenará en el DAO
    ownerId,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? now.split("T")[0],   // YYYY-MM-DD
    time: data.time ?? "00:00",             // Default hour
    duration: data.duration ?? 30,
    createdAt: now,
    updatedAt: now,
  };
};
