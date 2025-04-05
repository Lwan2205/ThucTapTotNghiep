const mongoose = require('mongoose')
const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating
