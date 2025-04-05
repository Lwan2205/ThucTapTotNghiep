const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', require: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },  // Sản phẩm
        quantity: { type: Number, required: true },  // Số lượng
        price: { type: Number, required: true }      // Giá mỗi sản phẩm
    }],
    totalAmount: { type: Number, require: true },
    status: { type: String, enum: ['Pending', 'Shipped', 'Canceled'], default: 'Pending' },
    // discount: { type: Number, default: 0 },
    // finalAmount: { type: Number, require: true },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['VNPay', 'COD'], default: 'COD' },
    address: { type: String, require: true }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema);
module.exports = Order