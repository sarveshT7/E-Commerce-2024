import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/errorClass.js";

export const newCoupon = TryCatch(
    async (req, res, next) => {
        const { coupon, amount } = req.body
        if (!coupon || !amount) {
            return next(new ErrorHandler("Please enter the coupon or amount", 400))
        }
        await Coupon.create({ coupon, amount })
        res.status(201).json({
            success: true,
            message: `coupon code ${coupon} has been successfully created`
        })
    }
)

export const applyDiscount = TryCatch(
    async (req, res, next) => {
        const { coupon } = req.query
        const discount = await Coupon.findOne({ coupon })
        if (!discount) {
            return next(new ErrorHandler("Invalid Coupon code", 400))
        }
        res.status(200).json({
            success: true,
            discount: discount.amount
        })
    }
)

export const allCoupons = TryCatch(
    async (req, res, next) => {
        const coupons = await Coupon.find({})
        if (!coupons) {
            return next(new ErrorHandler("Coupons not found", 404))
        }
        res.status(200).json({
            success: true,
            coupons
        })
    }
)

export const deleteCoupon = TryCatch(
    async (req, res, next) => {
        const { id } = req.params
        await Coupon.findByIdAndDelete(id)
        res.status(200).json({
            success: true,
            message: `coupon code deleted successfully`
        })
    }
)