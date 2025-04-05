const express = require('express')

const router = express.Router()


const { registerUser, loginUser, refreshAccessToken, logoutUser } = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")


// đăng kí ng dùng
router.post("/register", registerUser)
//đăng nhập ng dùng
router.post("/login", loginUser)
//refesh_token
router.post("/refresh_token", refreshAccessToken)
//đăng xuất ng dùng
router.post("/logout", logoutUser)



router.post('/product', protect, (req, res) => {
    res.status(201).json({ message: "succesfully" })
    console.log("success")
})

module.exports = router