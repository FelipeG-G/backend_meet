/**
 * Represents a user profile stored in Firestore.
 * Authentication is handled by Firebase Auth.
 */
export interface IUser {
  id: string; // Firebase Auth UID
  username: string;
  lastname: string;
  birthdate: string; // Date string or timestamp value
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Helper to generate a new user profile payload with defaults applied.
 *
 * @param data - Partial data received from the client.
 * @param id - Firebase Auth UID for the user.
 * @returns Complete user payload ready for persistence.
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
