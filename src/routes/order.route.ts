import express from 'express';
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from '../controllers/order.controller.js';
import { adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// routes /api/v1/order
router.post("/new", newOrder);

router.get("/myOrders", myOrders)

router.get("/allOrders", adminOnly, allOrders)

router.route("/:id")
    .get(getSingleOrder)
    .put(adminOnly, processOrder)
    .delete(adminOnly, deleteOrder)

export { router as orderRoutes };