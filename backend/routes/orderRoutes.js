const express = require('express')
const router = express.Router()

const { creatOrderFromCart, paymentReturn, updateStatusOrder, getAllOrder, getOrderByUserID, createOrUpdateRating } = require('../controllers/orderController')
const { protect, admin } = require('../middleware/authMiddleware')
//tạo đơn hàng

router.post('/add', protect, creatOrderFromCart)

//vnpay_return
router.get('/vnpay_return', paymentReturn)

//cập nhật trạng thái đơn hàng
router.put('/update/:id', protect, admin, updateStatusOrder)

//lấy tất cả đơn hàng

router.get("/", protect, admin, getAllOrder)

//lây đơn hàng của theo id ng dùng

router.get("/my-order", protect, getOrderByUserID)

//đánh giá của người dùng
router.post('/rate', protect, createOrUpdateRating);



module.exports = router