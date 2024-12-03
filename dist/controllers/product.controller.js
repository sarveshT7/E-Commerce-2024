import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/errorClass.js";
import { rm } from "fs";
import { nodeCache } from "../app.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, category, stock } = req.body;
    const photo = req.file;
    if (!photo) {
        return next(new ErrorHandler("Please add photo", 400));
    }
    if (!name || !price || !category || !stock) {
        rm(photo.path, () => {
            console.log('file is deleted');
        });
        return next(new ErrorHandler("Enter required fields for adding product", 400));
    }
    await Product.create({
        name,
        price,
        category: category.toLowerCase(),
        stock,
        photo: photo?.path
    });
    res.status(201).json({
        message: "Product is created successfully",
        success: true
    });
});
export const latestProducts = TryCatch(async (req, res, next) => {
    let products;
    if (nodeCache.has("all-products")) {
        products = JSON.parse(nodeCache.get("all-products"));
    }
    else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        nodeCache.set("all-products", JSON.stringify(products));
    }
    res.status(201).json({
        success: true,
        products
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    const categories = await Product.distinct("category");
    res.status(201).json({
        success: true,
        categories
    });
});
export const getAdminProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({});
    res.status(201).json({
        success: true,
        products
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { name, price, category, stock } = req.body;
    const { id } = req.params;
    const photo = req.file;
    const product = await Product.findById(id);
    if (!product) {
        return next(new ErrorHandler("Invalid product ID", 404));
    }
    if (photo) {
        rm(product.photo, () => {
            console.log('old pic is deleted');
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (category)
        product.category = category;
    if (stock)
        product.stock = stock;
    await product.save();
    res.status(201).json({
        message: "Product is updated successfully",
        success: true
    });
});
export const deleteProductByID = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    console.log("id of ", id);
    const product = await Product.findById(id);
    if (!product) {
        return next(new ErrorHandler("User not found", 400));
    }
    rm(product.photo, () => {
        console.log('pic is deleted');
    });
    await product.deleteOne();
    res.status(201).json({
        message: "Product has been deleted successfully",
        success: true
    });
});
export const getProductByID = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    console.log("id of ", id);
    const product = await Product.findById(id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        message: "Product found",
        product
    });
});
export const getAllProducts = TryCatch(async (req, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODDUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i"
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price),
        };
    if (category)
        baseQuery.category = category;
    const productPromise = await Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    const [productsFetched, filteredProducts] = await Promise.all([
        productPromise, Product.find(baseQuery)
    ]);
    const products = productsFetched;
    const totalPages = Math.ceil(filteredProducts.length / limit);
    res.status(200).json({
        success: true,
        products,
        totalPages,
        totalproducts: products.length
    });
});
// const generateRandomProducts = async (count: number = 10) => {
//     const products = [];
//     for (let i = 0; i < count; i++) {
//         const product = {
//             name: faker.commerce.productName(),
//             photo: "uploads\\5ba9bd91-b89c-40c2-bb8a-66703408f986.png",
//             price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//             stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//             category: faker.commerce.department(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt: new Date(faker.date.recent()),
//             __v: 0,
//         };
//         products.push(product);
//     }
//     await Product.create(products);
//     console.log({ succecss: true });
// };
// generateRandomProducts()
// const deleteRandomsProducts = async (count: number = 10) => {
//     const products = await Product.find({}).skip(2);
//     for (let i = 0; i < products.length; i++) {
//       const product = products[i];
//       await product.deleteOne();
//     }
//     console.log({ succecss: true });
//   };
// deleteRandomsProducts()  
