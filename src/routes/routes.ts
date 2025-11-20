import { Router } from "express";

import userRoutes from "./userRoutes";


import passwordRoutes from "./passwordRoutes";



const router = Router();

/**
 * Mount user-related routes.
 *
 * All routes defined in {@link userRoutes} will be accessible under `/users`.
 * Example:
 *   - GET  /users        → Get all users
 *   - POST /users        → Create a new user
 *   - GET  /users/:id    → Get a user by ID
 *   - PUT  /users/:id    → Update a user by ID
 *   - DELETE /users/:id  → Delete a user by ID
 */
router.use("/users", userRoutes);

router.use("/password", passwordRoutes);



export default router;
