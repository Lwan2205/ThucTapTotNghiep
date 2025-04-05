const Cart = require('../models/cart')
const Order = require('../models/order')
const Product = require('../models/product')
const Rating = require('../models/rating');
require('dotenv').config();
const crypto = require('crypto');
const moment = require('moment');
const querystring = require('qs');
const sha256 = require('sha256');

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

//Tạo đơn hàng từ giỏ hàng
const creatOrderFromCart = async (req, res) => {
    try {
        //lấy giỏ hàng ng dùng
        const cart = await Cart.findOne({ userId: req.user._id }).populate({
            path: 'products.productId',
            select: 'price quantity'
        });

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống' })
        }
        //Tính tổng đơn hàng
        let totalAmount = Math.round(cart.products.reduce((sum, item) => {
            const finalAmount = item.quantity * item.productId.price
            return sum + finalAmount
        }, 0))
        // if (totalAmount % 2 !== 0) {
        //     totalAmount -= 1;
        // }

        const productDetail = cart.products.map(item => {
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.productId.price,
            };
        })

        //lưu đơn hàng vào db
        const order = new Order({
            userId: req.user._id,
            products: productDetail,
            totalAmount: totalAmount,
            paymentStatus: req.body.paymentMethod === 'VNPay' ? 'Pending' : 'Completed',
            paymentMethod: req.body.paymentMethod || 'COD'

        })
        const createdOrder = await order.save()

        //Nếu thanh toán qua vnpay
        if (req.body.paymentMethod === 'VNPay') {
            let config = require('config');
            let tmnCode = config.get('vnp_TmnCode');
            let secretKey = config.get('vnp_HashSecret');
            let vnpUrl = config.get('vnp_Url');
            let returnUrl = config.get('vnp_ReturnUrl');

            const orderId = createdOrder._id.toString(); // Sử dụng ID đơn hàng
            let date = new Date();
            let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Amount'] = totalAmount * 100;
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = 'Thanh toán VNPay';
            vnp_Params['vnp_OrderType'] = 'billpayment';
            vnp_Params['vnp_Locale'] = 'vn';
            vnp_Params['vnp_ReturnUrl'] = returnUrl; // URL callback
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = moment(date).format('YYYYMMDDHHmmss');

            // Tạo chữ ký bảo mật
            vnp_Params = sortObject(vnp_Params);
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

            // Trả URL thanh toán VNPay
            return res.status(200).json({ payUrl: vnpUrl, orderId: createdOrder._id });
        }
        //trừ só lượng hàng trong kho
        const updateQuantity = cart.products.map(async item => {
            const product = item.productId
            const newQuantity = product.quantity - item.quantity
            if (newQuantity < 0) {
                throw new Error(`Sản phẩm ${product.name} không đủ số lượng trong kho.`);
            }
            await Product.findByIdAndUpdate(product._id, { quantity: newQuantity })
        })
        await Promise.all(updateQuantity)
        //Xóa giỏ hàng khi tạo đơn hàng
        cart.products = [];
        await cart.save()

        res.status(200).json({ data: createdOrder, success: true })
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        } else {
            console.error('Lỗi sau khi phản hồi đã gửi:', error);
        }
    }

}
//kêt quan thanh toan vnpay
// const paymentReturn = async (req, res) => {
//     try {
//         let vnp_Params = req.query; // Dữ liệu từ VNPay
//         let secureHash = vnp_Params['vnp_SecureHash']; // Lấy hash từ VNPay
//         delete vnp_Params['vnp_SecureHash'];
//         delete vnp_Params['vnp_SecureHashType'];

//         // Tạo lại chữ ký từ dữ liệu callback
//         vnp_Params = sortObject(vnp_Params);
//         let config = require('config');
//         let secretKey = config.get('vnp_HashSecret');
//         let signData = querystring.stringify(vnp_Params, { encode: false });
//         let hmac = crypto.createHmac("sha512", secretKey);
//         let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

//         if (secureHash === signed) {
//             const orderId = vnp_Params['vnp_TxnRef']; // Lấy ID đơn hàng
//             const paymentStatus = vnp_Params['vnp_ResponseCode'] === '00' ? 'Completed' : 'Failed';

//             if (paymentStatus === 'Completed') {
//                 // Xử lý thanh toán thành công
//                 const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });

//                 if (updatedOrder) {
//                     // Cập nhật kho sản phẩm sau khi thanh toán thành công
//                     const productUpdates = updatedOrder.products.map(async (product) => {
//                         const { productId, quantity } = product;
//                         const currentProduct = await Product.findById(productId);

//                         if (currentProduct) {
//                             const newStock = currentProduct.quantity - quantity;
//                             if (newStock < 0) {
//                                 throw new Error(`Sản phẩm ${currentProduct.name} không đủ số lượng trong kho.`);
//                             }
//                             // Cập nhật số lượng trong kho
//                             await Product.findByIdAndUpdate(productId, { quantity: newStock });
//                         }
//                     });

//                     await Promise.all(productUpdates);

//                     // Xóa giỏ hàng của người dùng sau khi thanh toán thành công
//                     const userId = updatedOrder.userId;
//                     const cart = await Cart.findOne({ userId });

//                     if (cart) {
//                         cart.products = []; // Xóa các sản phẩm trong giỏ hàng
//                         await cart.save();
//                     }
//                 }

//                 res.status(200).json({ message: 'Thanh toán thành công, trạng thái đơn hàng đã cập nhật và giỏ hàng đã được xóa.' });
//             } else {
//                 // Xử lý thanh toán thất bại
//                 await Order.findByIdAndDelete(orderId); // Xóa đơn hàng khỏi DB
//                 res.status(400).json({ message: 'Thanh toán thất bại, đơn hàng đã bị hủy.' });
//             }
//         } else {
//             res.status(400).json({ message: 'Chữ ký không hợp lệ' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const paymentReturn = async (req, res) => {
    try {
        let vnp_Params = req.query; // Dữ liệu từ VNPay
        let secureHash = vnp_Params['vnp_SecureHash']; // Lấy hash từ VNPay
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Tạo lại chữ ký từ dữ liệu callback
        vnp_Params = sortObject(vnp_Params);
        let config = require('config');
        let secretKey = config.get('vnp_HashSecret');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef']; // Lấy ID đơn hàng
            const paymentStatus = vnp_Params['vnp_ResponseCode'] === '00' ? 'Completed' : 'Failed';

            if (paymentStatus === 'Completed') {
                // Xử lý thanh toán thành công
                const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });

                if (updatedOrder) {
                    // Cập nhật kho sản phẩm sau khi thanh toán thành công
                    const productUpdates = updatedOrder.products.map(async (product) => {
                        const { productId, quantity } = product;
                        const currentProduct = await Product.findById(productId);

                        if (currentProduct) {
                            const newStock = currentProduct.quantity - quantity;
                            if (newStock < 0) {
                                throw new Error(`Sản phẩm ${currentProduct.name} không đủ số lượng trong kho.`);
                            }
                            // Cập nhật số lượng trong kho
                            await Product.findByIdAndUpdate(productId, { quantity: newStock });
                        }
                    });

                    await Promise.all(productUpdates);

                    // Xóa giỏ hàng của người dùng sau khi thanh toán thành công
                    const userId = updatedOrder.userId;
                    const cart = await Cart.findOne({ userId });

                    if (cart) {
                        cart.products = []; // Xóa các sản phẩm trong giỏ hàng
                        await cart.save();
                    }
                }

                // 🎯 ✅ Redirect về trang thanh toán thành công
                return res.redirect(`http://localhost:3000/payment/success?vnp_TxnRef=${orderId}`);
            } else {
                // Xử lý thanh toán thất bại
                await Order.findByIdAndDelete(orderId); // Xóa đơn hàng khỏi DB

                // ❌ Redirect về trang thanh toán thất bại
                return res.redirect("http://localhost:3000/payment/fail");
            }
        } else {
            return res.status(400).json({ message: 'Chữ ký không hợp lệ' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//cập nhật trạng thái đơn hàng
const updateStatusOrder = async (req, res) => {
    const { status } = req.body
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: status }, { new: true })
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Nếu trạng thái là Cancelled, khôi phục số lượng sản phẩm đã đặt
        if (status === 'Canceled') {
            for (const item of order.products) {
                const product = await Product.findById(item.productId)
                console.log(product.quantity)
                // Khôi phục số lượng sản phẩm nếu đơn hàng bị hủy
                product.quantity += item.quantity;
                await product.save();
            }
        }
        res.status(200).json({ order })

    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }

}

//lấy tất cả đơn hàng

const getAllOrder = async (req, res) => {
    try {
        const order = await Order.find()
        res.status(201).json({ data: order, success: true })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
}

//lấy đơn hàng ng dùng
//lấy đơn hàng của ng dùng 
const getOrderByUserID = async (req, res) => {
    try {
        // 1. Lấy tất cả đơn hàng có userId
        const orders = await Order.find({ userId: req.user._id })
            .populate("products.productId", "name images price")
            .lean(); // lấy dữ liệu thuần JS object

        // 2. Lọc sản phẩm bị null (do product đã bị xóa)
        const filteredOrders = orders
            .map((order) => {
                order.products = order.products.filter(p => p.productId !== null);
                return order;
            })
            .filter(order => order.products.length > 0); // chỉ lấy đơn có sản phẩm

        return res.status(200).json(filteredOrders);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createOrUpdateRating = async (req, res) => {
    const { productId, rating } = req.body;

    if (!productId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    try {
        // Kiểm tra xem người dùng đã mua sản phẩm chưa
        const hasPurchased = await Order.exists({
            userId: req.user._id,
            'products.productId': productId,
            paymentStatus: 'Completed'
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: 'Bạn chưa mua sản phẩm này nên không thể đánh giá.' });
        }

        // Tìm xem đã đánh giá chưa
        const existingRating = await Rating.findOne({
            userId: req.user._id,
            productId: productId
        });

        if (existingRating) {
            // Cập nhật đánh giá
            existingRating.rating = rating;
            await existingRating.save();
            return res.status(200).json({ message: 'Đã cập nhật đánh giá.', data: existingRating });
        } else {
            // Tạo đánh giá mới
            const newRating = new Rating({
                userId: req.user._id,
                productId,
                rating
            });

            await newRating.save();
            return res.status(201).json({ message: 'Đã tạo đánh giá.', data: newRating });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = ({
    creatOrderFromCart,
    paymentReturn,
    updateStatusOrder,
    getAllOrder,
    getOrderByUserID,
    createOrUpdateRating
})