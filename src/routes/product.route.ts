import express from 'express'
import { deleteProductByID, getAdminProducts, getAllCategories, getAllProducts, getProductByID, latestProducts, newProduct, updateProduct } from '../controllers/product.controller.js'
import { singleUpload } from '../middlewares/multer.js'
import { adminOnly } from '../middlewares/auth.js'

const router = express.Router()

//product routes  api/v1/product
router.post("/new", adminOnly, singleUpload, newProduct)
router.get("/latest", latestProducts)
router.get("/categories", getAllCategories)
router.get("/admin-products", getAdminProducts)
router.get("/all-products", getAllProducts)
router.route("/:id")
    .get(getProductByID)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProductByID)

export default router