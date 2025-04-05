const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: { type: String, require: true },
    description: { type: String },
    slug: { type: String, unique: true },
    isFeatured: { type: Boolean, default: false }

}, { timestamps: true })

const Category = mongoose.model("Category", categorySchema)

module.exports = Category