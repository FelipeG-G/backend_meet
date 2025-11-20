// src/dao/UserDAO.ts
import { firebaseDB } from "../config/firebase";  
import { IUser } from "../models/User";

const USERS_COLLECTION = "users";

class UserDAO {

  async create(id: string, userData: IUser): Promise<IUser> {
    await firebaseDB().collection(USERS_COLLECTION).doc(id).set(userData);
    return { ...userData, id };
  }

  async findById(id: string): Promise<IUser | null> {
    const snap = await firebaseDB().collection(USERS_COLLECTION).doc(id).get();
    return snap.exists ? (snap.data() as IUser) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const snap = await firebaseDB()
      .collection(USERS_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) return null;

    return snap.docs[0].data() as IUser;
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    await firebaseDB().collection(USERS_COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    await firebaseDB().collection(USERS_COLLECTION).doc(id).delete();
  }
}

export default new UserDAO();
