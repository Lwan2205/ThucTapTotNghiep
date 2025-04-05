const express = require('express')

const router = express.Router()

const { protect, admin } = require("../middleware/authMiddleware")
const { addProduct, getProductByID, getProductbyCategoryID, getAllProduct, updateProduct, deleteProduct } = require("../controllers/productController")
const cloudinaryFileUploader = require("../middleware/fileUploader")


//thêm sản pham
router.post("/add", protect, admin, cloudinaryFileUploader.single('image'), addProduct)

//lấy sản phẩm theo danh mục
router.get("/category/:categoryID", getProductbyCategoryID)

//lấy tất cả sản phẩm
router.get("/", getAllProduct)

//lây chi tiết sản phẩm
router.get("/:id", getProductByID)

//sửa sản phẩm
router.put("/:id", protect, admin, cloudinaryFileUploader.single('image'), updateProduct)

//xóa sản phẩm
router.delete("/:id", deleteProduct)

module.exports = router
