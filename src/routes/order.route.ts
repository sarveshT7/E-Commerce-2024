import express from 'express';
import { adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.post("/new-order", ()=>{

});
// router.get("/all", adminOnly, allUsers)
// // router.get("/all", allUsers)
// router.route("/:id").get(getUserByID).delete(deleteUserByID)

export { router as orderRoutes };