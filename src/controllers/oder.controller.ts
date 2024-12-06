import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";

export const newOrder = TryCatch(
    async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {


        const {
            shippingInfo,
            orderItems,
            user,
            shippingCharges,
            discount,
            subtotal,
            tax,
            total
        } = req.body

        await Order.create({
            shippingInfo,
            orderItems,
            user,
            shippingCharges,
            discount,
            subtotal,
            tax,
            total
        })
        await reduceStock(orderItems)
        invalidateCache({ product: true, order: true, admin: true })

    }
)