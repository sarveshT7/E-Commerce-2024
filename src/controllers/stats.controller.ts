import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getChartData, getInventoryCategories, MyDocument } from "../utils/features.js";

export const getdashboardStats = TryCatch(
    async (req, res, next) => {
        let stats = {}
        if (nodeCache.has("admin-stats"))
            stats = JSON.parse(nodeCache.get("admin-stats") as string)
        else {
            const today = new Date()
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(today.getMonth() - 6)
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
            const lastSixMonthsOrdersPromise = Order.find({
                createdAt: {
                    $gte: sixMonthsAgo,
                    $lte: today
                }
            })

            const latestTransactionPromise = Order.find({}).select(["orderItems", "discount", "status"]).limit(4)

            const [thisMonthProducts,
                thisMonthUsers,
                thisMonthOrders,
                lastMonthProducts,
                lastMonthUsers,
                lastMonthOrders,
                productCount,
                userCount,
                allOrders,
                lastSixMonthOrders,
                categories,
                femaleUsersCount,
                latestTransactions
            ] = await Promise.all([
                thisMonthProductsPromise,
                thisMonthUsersPromise,
                thisMonthOrdersPromise,
                lastMonthProductsPromise,
                lastMonthUsersPromise,
                lastMonthOrdersPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find({}).select("total"),
                lastSixMonthsOrdersPromise,
                Product.distinct("category"),
                User.countDocuments({ gender: "female" }),
                latestTransactionPromise
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
            const orderSixMonthlyCounts = new Array(6).fill(0);
            const orderSixMonthlyRevenue = new Array(6).fill(0)

            lastSixMonthOrders.forEach((order) => {
                const creationDate = order.createdAt
                const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12
                if (monthDiff < 6) {
                    orderSixMonthlyCounts[6 - monthDiff - 1] += 1
                    orderSixMonthlyRevenue[6 - monthDiff - 1] += order.total
                }
            })



            const categoryCount: Record<string, number>[] = await getInventoryCategories({
                categories,
                productCount
            })   // calling the function for category count

            const userRatio = {
                male: userCount - femaleUsersCount,
                female: femaleUsersCount
            }

            const modifiedTransaction = latestTransactions.map((item) => {
                return {
                    _id: item._id,
                    discount: item.discount,
                    amount: item.total,
                    quantity: item.orderItems.length,
                    status: item.status
                }
            })
            stats = {
                categoryCount,
                // categories,
                changePercentage,
                count,
                chart: {
                    order: orderSixMonthlyCounts,
                    revenue: orderSixMonthlyRevenue
                },
                userRatio,
                latestTransactions: modifiedTransaction
            }
            nodeCache.set("admin-stats", JSON.stringify(stats))
        }
        res.status(200).json({
            success: true,
            stats
        })


    }
)
export const getPieCharts = TryCatch(
    async (req, res, next) => {
        let charts;
        if (nodeCache.has("admin-pie-charts")) charts = JSON.parse(nodeCache.get("admin-pie-charts") as string)
        else {
            const [
                processedOrderCount,
                shippedOrderCount,
                deliveredOrderCount,
                categories,
                productCount,
                outOfStock,
                allOrders,
                allUsers
            ] = await Promise.all([
                Order.countDocuments({ status: "Processing" }),
                Order.countDocuments({ status: "Shipped" }),
                Order.countDocuments({ status: "Delivered" }),
                Product.distinct("category"),
                Product.countDocuments(),
                Product.countDocuments({ stock: 0 }),
                Order.find({}).select(["total", "subtotal", "discount", "tax", "shippingCharges"]),
                User.find({})
            ])
            const productCategories = await getInventoryCategories({
                categories,
                productCount
            })   // calling the function for category count

            const orderFulfillment = {
                processing: processedOrderCount,
                shipped: shippedOrderCount,
                delivered: deliveredOrderCount,
            }
            const stockAvailability = {
                inStock: productCount - outOfStock,
                outOfStock: outOfStock
            }
            const grossIncome = allOrders.reduce((prev, curr) => prev + (curr.total || 0), 0)
            const discount = allOrders.reduce((prev, curr) => prev + (curr.discount || 0), 0)
            const productionCost = allOrders.reduce((prev, curr) => prev + (curr.shippingCharges || 0), 0)
            const burnt = allOrders.reduce((prev, curr) => prev + (curr.tax || 0), 0)
            const marketingCost = Math.round(grossIncome * (30 / 100))
            const netMargin = grossIncome - discount - productionCost - burnt - marketingCost

            const revenueDistribution = {
                netMargin,
                discount,
                productionCost,
                burnt,
                marketingCost
            }

            const customers = {
                adminUsers: allUsers.filter(item => item.role === "admin")?.length,
                customerUsers: allUsers.filter(item => item.role === "user")?.length
            }
            const usersAgeGroup = {
                teen: allUsers.filter(item => item.age < 20)?.length,
                adult: allUsers.filter(item => item.age >= 20 && item.age <= 40)?.length,
                old: allUsers.filter(item => item.age > 40)?.length
            }
            charts = {
                orderFulfillment,
                productCategories,
                stockAvailability,
                revenueDistribution,
                customers,
                usersAgeGroup
            }
            nodeCache.set("admin-pie-charts", JSON.stringify(charts))
        }
        return res.status(200).json({
            success: true,
            charts
        })
    }
)
export const getBarCharts = TryCatch(
    async (req, res, next) => {
        const key = "admin-bar-garphs"
        let charts = {}
        if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string)
        else {
            const today = new Date()
            const sixMonthsAgo = new Date()
            const twelveMonthsAgo = new Date()

            sixMonthsAgo.setMonth(today.getMonth() - 6)
            twelveMonthsAgo.setMonth(today.getMonth() - 12)

            const sixMonthProductsPromise: Promise<MyDocument[]> = Product.find({
                createdAt: {
                    $gte: sixMonthsAgo,
                    $lte: today,
                }
            }).select("createdAt")

            const sixmonthUsersPromise: Promise<MyDocument[]> = User.find({
                createdAt: {
                    $gte: sixMonthsAgo,
                    $lte: today
                }
            }).select("createdAt")

            const twelveMonthOrdersPromise: Promise<MyDocument[]> = Order.find({
                createdAt: {
                    $gte: twelveMonthsAgo,
                    $lte: today
                }
            }).select("createdAt")
            const [products, users, orders] = await Promise.all([
                sixMonthProductsPromise,
                sixmonthUsersPromise,
                twelveMonthOrdersPromise
            ])
            const productCounts = getChartData({ length: 6, today, docArr: products as MyDocument[] });
            const usersCounts = getChartData({ length: 6, today, docArr: users });
            const ordersCounts = getChartData({ length: 12, today, docArr: orders });

            charts = {
                products: productCounts,
                users: usersCounts,
                orders: ordersCounts
            }
        }
        return res.status(200).json({
            success: true,
            charts
        })
    }
)
export const getlineCharts = TryCatch(
    async (req, res, next) => {
        const key = "admin-bar-garphs"
        let charts = {}
        if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string)
        else {
            const today = new Date()
            const twelveMonthsAgo = new Date()
            twelveMonthsAgo.setMonth(today.getMonth() - 12)
            const baseQuery = {
                createdAt: {
                    $gte: twelveMonthsAgo,
                    $lte: today
                }
            }
            const tweleveMonProductsPromise: Promise<MyDocument[]> = Product.find(baseQuery).select("createdAt")
            const tweleveMonUsersPromise: Promise<MyDocument[]> = User.find(baseQuery).select("createdAt")
            const tweleveMonOrdersPromise: Promise<MyDocument[]> = Order.find(baseQuery).select("createdAt")

            const [products, users, orders] = await Promise.all([
                tweleveMonProductsPromise,
                tweleveMonUsersPromise,
                tweleveMonOrdersPromise
            ])
            const productCounts = getChartData({ length: 12, today, docArr: products });
            const usersCounts = getChartData({ length: 12, today, docArr: users });
            const discount = getChartData({
                length: 12, today, docArr: orders, property: "discount",
            });
            const revenue = getChartData({
                length: 12, today, docArr: orders, property: "total"
            });
            charts = {
                users: usersCounts,
                products: productCounts,
                discount,
                revenue,
            };
        }
        return res.status(200).json({
            success: true,
            charts
        })
    }
)