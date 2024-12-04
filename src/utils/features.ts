import mongoose from "mongoose"
import { InvalidateProps } from "../types/types.js"
import { nodeCache } from "../app.js"
import { Product } from "../models/product.js"


export const connectDB = (URI: string) => {
    mongoose.connect(URI, {
        dbName: "Ecommerce-2024"
    }).then((c) => console.log(`Db connected to ${c.connection.host}`))
        .catch((err) => console.log('error in connecting DB', err))
}

export const invalidateProductCache = async ({ product, order, admin }: InvalidateProps) => {
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