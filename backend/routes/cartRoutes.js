const express = require('express')

const router = express.Router()

const { protect, admin } = require("../middleware/authMiddleware")
const { addToCart, getUserCart, deleteProductFromCart, clearCart, updateCart } = require('../controllers/cartController')

//thêm vào giỏ hàng
router.post('/add', protect, addToCart)
//lấy giỏ hàng ng dung
router.get('/', protect, getUserCart)
//xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:productId', protect, deleteProductFromCart)
//Xóa giỏ hàng
router.delete('/clear', protect, clearCart)
//Câp nhật giỏ hàng
router.put('/update', protect, updateCart)




module.exports = router