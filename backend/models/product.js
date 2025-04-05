const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: { type: String, require: true },
    description: { type: String },
    color: { type: String },
    price: { type: Number, require: true },
    quantity: { type: Number, min: 0 },
    reOrderLevel: { type: Number, min: 0, default: 10 },
    images: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: { type: String },
    isFeatured: { type: Boolean, default: false },

}, { timestamps: true })

const Product = mongoose.model("Product", productSchema)

module.exports = Product