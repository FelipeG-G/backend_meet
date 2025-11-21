// src/dao/MeetingDAO.ts
import { firebaseDB } from "../config/firebase";
import { IMeeting } from "../models/Meeting";

const MEETINGS_COLLECTION = "meetings";

class MeetingDAO {

  async create(meetingData: IMeeting): Promise<IMeeting> {
    const collection = firebaseDB().collection(MEETINGS_COLLECTION);

    // Generamos ID automático
    const docRef = collection.doc();
    const id = docRef.id;

    const finalData = { ...meetingData, id };

    await docRef.set(finalData);

    return finalData;
  }

  async getById(id: string): Promise<IMeeting | null> {
    const snap = await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .doc(id)
      .get();

    return snap.exists ? (snap.data() as IMeeting) : null;
  }

  async getByHostId(ownerId: string): Promise<IMeeting[]> {
    const snap = await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .where("ownerId", "==", ownerId)
      .get();

    return snap.docs.map((doc) => doc.data() as IMeeting);
  }

  async update(id: string, data: Partial<IMeeting>): Promise<void> {
    await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      });
  }

  async delete(id: string): Promise<void> {
    await firebaseDB()
      .collection(MEETINGS_COLLECTION)
      .doc(id)
      .delete();
  }
}

export default new MeetingDAO();
