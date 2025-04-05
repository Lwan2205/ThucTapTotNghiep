// const User = require("../models/user")
// var jwt = require('jsonwebtoken');
// require("dotenv").config()

// const protect = async (req, res, next) => {
//     if (req.cookies.access_token) {
//         try {
//             const token = req.cookies.access_token


//             const decoded = jwt.verify(token, process.env.JWT_TOKEN)

//             req.user = await User.findById(decoded.id).select('-password')
//             next()

//         }
//         catch (err) {
//             res.status(401).json({ message: err })
//         }
//     }
//     else {
//         res.status(401).json({ message: 'Not authorized, no token' });
//     }

// }
// const admin = (req, res, next) => {
//     if (req.user && req.user.role == "admin") {
//         next();
//     } else {
//         res.status(403).json({ message: 'Admin access required' });
//     }
// };

// module.exports = { protect, admin };
const User = require("../models/user");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const protect = async (req, res, next) => {
    let token;

    // Kiểm tra token trong headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]; // Lấy token sau "Bearer "
    } 
    // Nếu không có trong headers, thử lấy từ cookies
    else if (req.cookies.access_token) {
        token = req.cookies.access_token;
    }

    // Nếu không có token, trả về lỗi
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);

        // Tìm user theo ID trong token
        req.user = await User.findById(decoded.id).select("-password");

        // Nếu user không tồn tại
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next(); // Chuyển qua middleware tiếp theo
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Admin access required" });
    }
};

module.exports = { protect, admin };
