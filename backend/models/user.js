const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true, },
    password: { type: String, require: true, minleght: [8, "Phải có ít nhất 8 ký tự"] },
    phoneNumber: { type: String, require: true },
    address: { type: String, require: true },
    role: { type: String, enum: ['admin', 'user'], default: "user" },
    refresh_token: { type: String },
    age: { type: Number, require: true },  // Trường tuổi
    gender: { type: String, enum: ['nam', 'nữ'], require: true }  // Trường giới tính (nam, nữ)
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

module.exports = User
