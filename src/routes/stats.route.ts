import express from 'express';
import { allUsers, deleteUserByID, getUserByID, newUser } from '../controllers/user.controller.js';
import { adminOnly } from '../middlewares/auth.js';
import { getBarCharts, getdashboardStats, getlineCharts, getPieCharts } from '../controllers/stats.controller.js';

const router = express.Router();

// /api/v1/dashboard/stats route
router.get("/stats", adminOnly, getdashboardStats);

// /api/v1/dashboard/pie route
router.get("/pie", adminOnly, getPieCharts);

// /api/v1/dashboard/bar route
router.get("/bar", adminOnly, getBarCharts);

// /api/v1/dashboard/line route
router.get("/line", adminOnly, getlineCharts);


export { router as dashboardRoutes };