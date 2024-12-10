import express from 'express';
import { allOrders, myOrders, newOrder } from '../controllers/order.controller.js';
import { adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// routes /api/v1/order
router.post("/new", newOrder);

router.get("/myOrders/:id", myOrders)

router.get("/allOrders", adminOnly, allOrders)

// // router.get("/all", allUsers)
// router.route("/:id").get(getUserByID).delete(deleteUserByID)

export { router as orderRoutes };