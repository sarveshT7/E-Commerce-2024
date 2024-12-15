import mongoose, { Model } from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        coupon: {
            type: String,
            required: [true, "Enter the coupon code"],
            unique: true
        },
        amount: {
            type: Number,
            required: [true, "Enter the discount amount"],
        }
    }
)
export const Coupon = mongoose.model("Coupon", couponSchema)