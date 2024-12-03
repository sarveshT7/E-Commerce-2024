import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the product name"]
    },
    price: {
        type: Number,
        required: [true, "Please enter the product price"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter the product stock"]
    },
    photo: {
        type: String,
        required: [true, "Please enter the product photo"]
    },
    category: {
        type: String,
        required: [true, "Please enter the product category"],
        trim: true
    }
},
    {
        timestamps: true
    })


export const Product = mongoose.model("Product", productSchema)