import express from 'express'
import { connectDB } from './utils/features.js'
import { errorMiddleware } from './middlewares/error.js'
import { config } from 'dotenv'
import morgan from 'morgan'

//importing routes
import { userRoutes } from './routes/user.route.js'
import productRoutes from './routes/product.route.js'
import NodeCache from 'node-cache'
import { orderRoutes } from './routes/order.route.js'
import { couponRouter } from './routes/payment.route.js'
import { dashboardRoutes } from './routes/stats.route.js'
import Stripe from 'stripe'


config({
    path: "./.env"
})
const PORT = process.env.PORT || 4000
const URI = process.env.MONGO_URI || ""
const stripeKey = process.env.STRIPE_URI || ""
// console.log("port",process.env.PORT)
connectDB(URI)

const app = express()
app.use(express.json());
app.use(morgan("dev"))

export const stripe = new Stripe(stripeKey);

export const nodeCache = new NodeCache()
// api version1 of user
app.use('/api/v1/user', userRoutes)

//api version1 of product
app.use('/api/v1/product', productRoutes)

//api version of order
app.use('/api/v1/order', orderRoutes)

//api version of payment
app.use('/api/v1/payment', couponRouter)

//api version of dashboard
app.use('/api/v1/dashboard', dashboardRoutes)



app.get("/", (req, res) => {
    res.send("Api working with /api/v1")
})


app.use("/uploads", express.static("uploads"))
app.use(errorMiddleware)
app.listen(PORT, () => {
    console.log(`app listens on http://localhost/${PORT}`)
})
