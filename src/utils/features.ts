import mongoose from "mongoose"
import { ExportOrderType, InvalidateProps } from "../types/types.js"
import { nodeCache } from "../app.js"
import { Product } from "../models/product.js"
import ErrorHandler from "./errorClass.js"
import { Order } from "../models/order.js"


export const connectDB = (URI: string) => {
    mongoose.connect(URI, {
        dbName: "Ecommerce-2024"
    }).then((c) => console.log(`Db connected to ${c.connection.host}`))
        .catch((err) => console.log('error in connecting DB', err))
}

export const invalidateCache = async ({ product, order, admin, orderId, userId, productId }: InvalidateProps) => {
    if (product) {
        const productKeys = ["latest-products", "all-categories", "admin-products"]
        if (typeof productId == "string") productKeys.push(`product-${productId}`)
        if (typeof productId == "object") productId.forEach(item => productKeys.push(`product-${item}`))
        nodeCache.del(productKeys)          // deleting product from the cache
    }
    if (admin) {

    }
    if (order) {
        const orderKeys: string[] = ['all-orders', `my-orders-${userId}`, `single-order-${orderId}`]
        nodeCache.del(orderKeys)        // deleting order from the cache

    }
}

export const reduceStock = async (orderItems: ExportOrderType[]) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        let product = await Product.findById(order.productId)
        if (!product) {
            throw new Error("Product not found")
        }
        product.stock -= order.quantity
        await product.save()

    }

}

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    console.log('verify', thisMonth, lastMonth)
    if (thisMonth == 0) return 0
    if (lastMonth === 0) return thisMonth * 100
    else {
        const percent = (thisMonth / lastMonth) * 100
        return Number(percent.toFixed())
    }
}

export const getInventoryCategories = async ({ categories, productCount }: { categories: string[], productCount: number }) => {
    const categoriesCountPromise = categories.map(category => Product.countDocuments({ category }))
    const categoriesCount = await Promise.all(categoriesCountPromise)

    const categoryCount: Record<string, number>[] = []

    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productCount) * 100)
        })
    })
    return categoryCount
}