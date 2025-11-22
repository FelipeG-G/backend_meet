// src/dao/UserDAO.ts
import { firebaseDB } from "../config/firebase";
import { IUser } from "../models/User";

const USERS_COLLECTION = "users";

/**
 * Data access object for user profile documents stored in Firestore.
 */
export class UserDAO {
  /**
   * Persist a new user document with a provided id.
   *
   * @param id - Firebase Auth UID.
   * @param userData - User payload to store.
   * @returns Stored user including id.
   */
  async create(id: string, userData: IUser): Promise<IUser> {
    await firebaseDB().collection(USERS_COLLECTION).doc(id).set(userData);
    return { ...userData, id };
  }

  /**
   * Find a user document by id.
   *
   * @param id - Firebase Auth UID.
   * @returns User data or null if it does not exist.
   */
  async findById(id: string): Promise<IUser | null> {
    const snap = await firebaseDB().collection(USERS_COLLECTION).doc(id).get();
    return snap.exists ? (snap.data() as IUser) : null;
  }

  /**
   * Find a user document by email.
   *
   * @param email - Email to search.
   * @returns First matching user or null.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const snap = await firebaseDB()
      .collection(USERS_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) return null;

    return snap.docs[0].data() as IUser;
  }

  /**
   * Apply partial updates to a user document.
   *
   * @param id - Firebase Auth UID.
   * @param data - Fields to update.
   */
  async update(id: string, data: Partial<IUser>): Promise<void> {
    await firebaseDB().collection(USERS_COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove a user document.
   *
   * @param id - Firebase Auth UID.
   */
  async delete(id: string): Promise<void> {
    await firebaseDB().collection(USERS_COLLECTION).doc(id).delete();
  }
}

const userDAO = new UserDAO();
export default userDAO;
