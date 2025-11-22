/**
 * Represents a meeting created by a user.
 */
export interface IMeeting {
  id: string; // Firestore document ID
  ownerId: string; // UID of the user who created the meeting
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // Minutes
  createdAt: string;
  updatedAt: string;
}

/**
 * Build a complete meeting object before storing it in Firestore.
 *
 * @param data - Partial meeting payload supplied by the client.
 * @param ownerId - UID of the user who owns the meeting.
 * @returns Meeting object with defaults and timestamps applied.
 */
export const createMeetingData = (
  data: Partial<IMeeting>,
  ownerId: string
): IMeeting => {
  const now = new Date().toISOString();

  return {
    id: "", // Filled by the DAO when persisting
    ownerId,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? now.split("T")[0],
    time: data.time ?? "00:00",
    duration: data.duration ?? 30,
    createdAt: now,
    updatedAt: now,
  };
};
