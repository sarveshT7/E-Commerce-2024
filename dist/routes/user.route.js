import express from 'express';
import { allUsers, deleteUserByID, getUserByID, newUser } from '../controllers/user.controller.js';
import { adminOnly } from '../middlewares/auth.js';
const router = express.Router();
router.post("/new-user", newUser);
router.get("/all", adminOnly, allUsers);
// router.get("/all", allUsers)
router.route("/:id").get(getUserByID).delete(deleteUserByID);
export { router as userRoutes };
