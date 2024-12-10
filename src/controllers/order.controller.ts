import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/errorClass.js";
import { nodeCache } from "../app.js";

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

        if (!shippingInfo ||
            !orderItems ||
            !user ||
            !shippingCharges ||
            !discount ||
            !subtotal ||
            !tax ||
            !total) {
            return next(new ErrorHandler("Please enter all fields", 400))
        }

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

        await invalidateCache({ product: true, order: true, admin: true })

        res.status(201).json({
            success: "true",
            message: "Order is placed successfully"
        })

    }
)

export const myOrders = TryCatch(
    async (req, res, next) => {
        let orders;
        const { id: userID } = req.params
        const key = `my-orders-${userID}`

        if (nodeCache.has(key)) {
            orders = JSON.parse(nodeCache.get(key) as string)
        } else {
            orders = await Order.find({ user: userID })
            nodeCache.set(key, JSON.stringify(orders))
        }
        console.log('orders', orders)
        if (!orders) {
            return next(new ErrorHandler("Order not found", 400))
        }
        res.status(200).json({
            success: true,
            orders
        })


    }
)

export const allOrders = TryCatch(
    async (req, res, next) => {
        let orders;
        const key = `all-orders`

        if (nodeCache.has(key)) {
            orders = JSON.parse(nodeCache.get(key) as string)
        } else {
            orders = await Order.find().populate("user", "name")
            nodeCache.set(key, JSON.stringify(orders))
        }
        console.log('orders', orders)
        if (!orders) {
            return next(new ErrorHandler("Order not found", 400))
        }
        res.status(200).json({
            success: true,
            orders
        })


    }
)