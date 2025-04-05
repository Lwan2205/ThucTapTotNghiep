const express = require('express')

const router = express.Router()

const { getUserProfile, updateUserProfile, deleteUser,getAll } = require("../controllers/userController")

const { protect, admin } = require("../middleware/authMiddleware")


//láy thong tin ng dùng
router.get("/user-profile", protect, getUserProfile)
router.get("/getAll", protect, getAll)


//update ng dung

router.put("/update-user", protect, updateUserProfile)

// Xóa người dùng (Admin)
router.delete('/:id', protect, admin, deleteUser);

module.exports = router


