import express from "express"
import { allCoupons, applyDiscount, deleteCoupon, newCoupon } from "../controllers/payment.controller.js"
import { adminOnly } from "../middlewares/auth.js"

const route = express.Router()

// api version /api/v1/payment/coupon/new
route.post('/coupon/new', adminOnly, newCoupon)

// api version /api/v1/payment/discount
route.get('/discount', applyDiscount)

// api version /api/v1/payment/coupon/all
route.get('/coupon/all', allCoupons)

// api version /api/v1/payment/coupon
route.delete('/coupon/:id', deleteCoupon)

export { route as couponRouter }