/**
 * @interface IUser
 * @description Represents a User profile stored in Firestore.
 * Authentication (email/password) will be handled by Firebase Auth.
 */
export interface IUser {
  id: string;        // Firebase Auth UID
  username: string;
  lastname: string;
  birthdate: string;  // Firestore usually stores dates as strings or Timestamps
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @function createUserData
 * @description Helper to generate new user data for Firestore.
 */
export const createUserData = (data: Partial<IUser>, id: string): IUser => {
  const now = new Date().toISOString();

  return {
    id,
    username: data.username ?? "",
    lastname: data.lastname ?? "",
    birthdate: data.birthdate ?? "",
    email: data.email ?? "",
    createdAt: now,
    updatedAt: now,
  };
};
