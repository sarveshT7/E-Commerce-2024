import mongoose from "mongoose"
import { ExportOrderType, InvalidateProps } from "../types/types.js"
import { nodeCache } from "../app.js"
import { Product } from "../models/product.js"
import ErrorHandler from "./errorClass.js"


export const connectDB = (URI: string) => {
    mongoose.connect(URI, {
        dbName: "Ecommerce-2024"
    }).then((c) => console.log(`Db connected to ${c.connection.host}`))
        .catch((err) => console.log('error in connecting DB', err))
}

export const invalidateCache = async ({ product, order, admin }: InvalidateProps) => {
    if (product) {
        const productKeys = ["latest-products", "all-categories", "admin-products"]

        const products = await Product.find({}).select("_id")
        products.forEach(prod => productKeys.push(`single-product-${prod._id}`)) // getting all the product ids
        nodeCache.del(productKeys)          // deleting from the cache
    }
    if (admin) {

    }
    if (order) {

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