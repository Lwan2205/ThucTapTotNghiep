const User = require("../models/user")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const saltRounds = 10;

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_TOKEN, {
        expiresIn: '10d'
    })
}
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN, {
        expiresIn: '30d'
    })
}

const registerUser = async (req, res) => {
    const { userName, email, password, phoneNumber, address } = req.body
    if (!userName || !email || !password || !phoneNumber || !address) {
        return res.status(400).json({ message: "Please fill fully" })
    }
    try {

        const hashPassword = await bcrypt.hash(password, saltRounds)
        const user = await User.create({
            userName,
            email,
            password: hashPassword,
            phoneNumber,
            address
        })
        res.status(201).json({ message: "Register successfully" })
    }
    catch (err) {
        res.status(500).json(err.message)
    }


}
const loginUser = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill fully" })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (user && await bcrypt.compare(password, user.password)) {
            const access_token = generateToken(user._id)
            const refresh_token = generateRefreshToken(user._id)

            await User.findByIdAndUpdate(user._id, { refresh_token: refresh_token }, { new: true })

            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',

                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',

                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });


            res.status(200).json({ message: "Login succesfully", data: user,token: access_token ,refreshToken:refresh_token,email:user.email})
            // res.status(200).json({
            //     success: true,
            //     _id: user._id,
            //     username: user.username,
            //     email: user.email,
            //     isAdmin: user.role,
            // });
        }
        else {
            res.status(400).json({ message: "Invalid email or password" })
        }

    }
    catch (err) {
        return res.status(500).json({ message: err })
    }

}   



const refreshAccessToken = async (req, res) => {
    if (req.cookies && req.cookies.refresh_token) {
        const refresh_token = req.cookies.refresh_token;

        try {
            // Xác minh refresh token
            const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN);

            // Tìm người dùng dựa trên ID từ token
            const user = await User.findById(decoded.id);
            if (!user || user.refresh_token !== refresh_token) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            // Tạo access token mới
            const access_token = generateToken(user._id);

            // Lưu access token vào cookie (tùy chọn)
            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            // Trả về access token
            res.status(200).json({ access_token });
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Refresh token expired, please login again.' });
            }
            res.status(400).json({ message: err.message });
        }
    } else {
        res.status(401).json({ message: 'No refresh token provided' });
    }
};

const logoutUser = async (req, res) => {
    try {
        if (!req.cookies.refresh_token || !req.cookies.access_token) {
            res.status(400).json({
                message: "No tokens"
            })
        }
        const refesh_token = req.cookies.refresh_token

        const user = await User.findOneAndUpdate(
            { refresh_token: refesh_token },
            { $unset: { refresh_token: "" } },
            { new: true }
        )

        if (!user) {
            res.status(401).json({ message: "Invalid refresh token" })
        }
        //xóa cookies
        res.clearCookie('access_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.clearCookie('refresh_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.status(400).json({ message: "Log out successfully" })

    }
    catch (err) {
        res.status(201).json({ message: 'Error logging out', error: err.message })

    }
}





module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
}