import express from 'express'
import { connectDB } from './utils/features.js'
import { errorMiddleware } from './middlewares/error.js'
import {config} from 'dotenv'

//importing routes
import {userRoutes} from './routes/user.route.js'
import productRoutes from './routes/product.route.js'
import NodeCache from 'node-cache'

const PORT = process.env.PORT || 4000
const URI = process.env.MONGO_URI || ""
config({
    path:"./.env"
})
console.log("port",process.env.PORT)
connectDB(URI)

const app = express()
app.use(express.json());

export const nodeCache = new NodeCache()
// api version1 of user
app.use('/api/v1/user', userRoutes)

//api version1 of product
app.use('/api/v1/product',productRoutes)

app.get("/", (req, res) => {
    res.send("Api working with /api/v1")
})

app.use("/uploads",express.static("uploads"))
app.use(errorMiddleware)
app.listen(PORT, () => {
    console.log(`app listens on http://localhost/${PORT}`)
})