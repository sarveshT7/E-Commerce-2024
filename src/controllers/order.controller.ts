import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/errorClass.js";
import { nodeCache } from "../app.js";


export const myOrders = TryCatch(
    async (req, res, next) => {
        let orders;
        const { id: userID } = req.query
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

export const getSingleOrder = TryCatch(
    async (req, res, next) => {
        const { id } = req.params;
        const key = `single-order-${id}`
        let order;
        if (nodeCache.has(key)) order = JSON.parse(nodeCache.get(key) as string)
        else {
            order = await Order.findById(id).populate("user", "name")
            nodeCache.set(key, JSON.stringify(order))
        }
        if (!order) {
            return next(new ErrorHandler("Order not found", 400))
        }
        res.status(200).json({
            success: true,
            order
        })

    }
)

export const processOrder = TryCatch(
    async (req, res, next) => {
        const { id } = req.params;
        const order = await Order.findById(id).populate("user", "name")
        if (!order) {
            return next(new ErrorHandler("Order not found", 400))
        }
        switch (order.status) {
            case "Processing": order.status = "Shipped";
                break
            case "Shipped": order.status = "Delivered";
                break;
            case "Delivered": order.status = "Delivered";
                break
        }
        await invalidateCache({
            product: false,
            order: true,
            admin: true,
            userId: order.user,
            orderId: String(order._id)
        })
        await order.save();
        res.status(200).json({
            success: true,
            message: "Order processed successfully"
        })

    }
)
export const deleteOrder = TryCatch(
    async (req, res, next) => {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return next(new ErrorHandler("Order not found", 400))
        }
        await order.deleteOne()
        await invalidateCache({
            product: false,
            order: true,
            admin: true,
            userId: order.user,
            orderId: String(order._id)
        })
        return res.status(200).json({
            success: true,
            message: "Order Deleted Successfully",
        });
    }
)

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

       const order=  await Order.create({
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

        await invalidateCache({
            product: true,
            order: true,
            admin: true,
            userId: user,
            productId: order.orderItems.map(i => String(i.productId))
        })

        res.status(201).json({
            success: "true",
            message: "Order is placed successfully"
        })

    }
)