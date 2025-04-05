const express = require('express')

const router = express.Router()


const { addCategory, getAllCategories, getCategoryByID, updateCategory, deleteCategory } = require("../controllers/categoryController")
const { protect, admin } = require("../middleware/authMiddleware")


//lấy danh mục theo id
router.get("/:id", getCategoryByID)

//lấy tất cả danh mục
router.get("/", getAllCategories)

//thêm danh mục
router.post("/add", protect, admin, addCategory)

//sửa danh mục

router.put("/:id", protect, admin, updateCategory)

//xóa danh mục

router.delete("/:id", protect, admin, deleteCategory)

module.exports = router