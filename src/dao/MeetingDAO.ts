// src/dao/MeetingDAO.ts
import { firebaseDB } from "../config/firebase";
import { IMeeting } from "../models/Meeting";

const MEETINGS_COLLECTION = "meetings";

/**
 * Data access object for meeting documents stored in Firestore.
 */
export class MeetingDAO {
  /**
   * Create a meeting document with a generated id.
   *
   * @param meetingData - Meeting payload without id.
   * @returns Persisted meeting including generated id.
   */
  async create(meetingData: IMeeting): Promise<IMeeting> {
    const collection = firebaseDB().collection(MEETINGS_COLLECTION);

    // Generate Firestore document id up front so it can be returned.
    const docRef = collection.doc();
    const id = docRef.id;

    const finalData = { ...meetingData, id };

    await docRef.set(finalData);

    return finalData;
  }

  /**
   * Get a meeting by id.
   *
   * @param id - Meeting id (Firestore document id).
   */
  async getById(id: string): Promise<IMeeting | null> {
    const snap = await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .doc(id)
      .get();

    return snap.exists ? (snap.data() as IMeeting) : null;
  }

  /**
   * List meetings owned by a specific user.
   *
   * @param ownerId - UID of the meeting owner.
   */
  async getByHostId(ownerId: string): Promise<IMeeting[]> {
    const snap = await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .where("ownerId", "==", ownerId)
      .get();

    return snap.docs.map((doc) => doc.data() as IMeeting);
  }

  /**
   * Apply partial updates to a meeting.
   *
   * @param id - Meeting document id.
   * @param data - Fields to update.
   */
  async update(id: string, data: Partial<IMeeting>): Promise<void> {
    await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      });
  }

  /**
   * Delete a meeting by id.
   *
   * @param id - Meeting document id.
   */
  async delete(id: string): Promise<void> {
    await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .doc(id)
      .delete();
  }
}

const meetingDAO = new MeetingDAO();
export default meetingDAO;
