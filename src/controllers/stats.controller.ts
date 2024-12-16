import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../utils/features.js";

export const getdashboardStats = TryCatch(
    async (req, res, next) => {
        let stats = {}
        if (nodeCache.has("admin-stats"))
            stats = JSON.parse(nodeCache.get("admin-stats") as string)
        else {
            const today = new Date()
            const thisMonth = {
                start: new Date(today.getFullYear(), today.getMonth(), 1),
                end: new Date(today)
            }
            const lastMonth = {
                start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                end: new Date(today.getFullYear(), today.getMonth(), 0)
            }
            const thisMonthProductsPromise = Product.find({
                createdAt: {
                    $gte: thisMonth.start,
                    $lte: thisMonth.end
                }
            })
            const lastMonthProductsPromise = Product.find({
                createdAt: {
                    $gte: lastMonth.start,
                    $lte: lastMonth.end
                }
            })

            const thisMonthUsersPromise = User.find({
                createdAt: {
                    $gte: thisMonth.start,
                    $lte: thisMonth.end
                }
            })
            const lastMonthUsersPromise = User.find({
                createdAt: {
                    $gte: lastMonth.start,
                    $lte: lastMonth.end
                }
            })


            const thisMonthOrdersPromise = Order.find({
                createdAt: {
                    $gte: thisMonth.start,
                    $lte: thisMonth.end
                }
            })
            const lastMonthOrdersPromise = Order.find({
                createdAt: {
                    $gte: lastMonth.start,
                    $lte: lastMonth.end
                }
            })

            const [thisMonthProducts,
                thisMonthUsers,
                thisMonthOrders,
                lastMonthProducts,
                lastMonthUsers,
                lastMonthOrders,
                productCount,
                userCount,
                allOrders
            ] = await Promise.all([
                thisMonthProductsPromise,
                thisMonthUsersPromise,
                thisMonthOrdersPromise,
                lastMonthProductsPromise,
                lastMonthUsersPromise,
                lastMonthOrdersPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find({}).select("total")
            ])
            const thisMonthRevenue = thisMonthOrders.reduce((prev, curr) => prev + (curr.total), 0)
            const lastMonthRevenue = lastMonthOrders.reduce((prev, curr) => prev + (curr.total), 0)

            const changePercentage = {
                revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
                products: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
                users: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
                orders: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)
            }

            const revenue = allOrders.reduceRight((prev, curr) => prev + (curr.total || 0), 0)

            const count = {
                revenue: revenue,
                products: productCount,
                users: userCount,
                orders: allOrders.length
            }

            stats = {
                changePercentage,
                count
            }


        }
        res.status(200).json({
            success: true,
            stats
        })


    }
)
export const getPieCharts = TryCatch(
    async (req, res, next) => {

    }
)
export const getBarCharts = TryCatch(
    async (req, res, next) => {

    }
)
export const getlineCharts = TryCatch(
    async (req, res, next) => {

    }
)