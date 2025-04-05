const Cart = require("../models/cart")
const Product = require("../models/product")


//thêm vào giỏ hàng
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body

    if (!productId || !quantity) {
        return res.status(400).json({ message: "Product and quantity must require" })
    }

    try {
        //kiểm tra sản phẩm có tồn tại?
        const product = await Product.findById(productId)
        if (!product) {
            res.status(404).json({ message: "Product not found" })
        }
        console.log(product.quantity)
        //kiểm tra số lượng yêu cầu có vượt quá số lượng trong kho
        if (quantity > product.quantity) {
            res.status(400).json({ message: "Insufficient stock available" })
        }

        //tìm giỏ hàng ng dung nếu k có thì tạo mới
        let cart = await Cart.findOne({ userId: req.user._id })

        if (cart) {
            //kiếm tra xem sản phẩm có trong giỏ hàng chưa
            const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
            if (productIndex > -1) {
                const newQuantity = cart.products[productIndex].quantity + quantity
                if (newQuantity > product.quantity) {
                    return res.status(400).json({ message: 'Insufficient stock available for the requested quantity' });
                }
                cart.products[productIndex].quantity = newQuantity
            }
            else {
                // Nếu sản phẩm chưa có, kiểm tra trước khi thêm
                if (quantity > product.quantity) {
                    return res.status(400).json({ message: 'Insufficient stock available for the requested quantity' });
                }

                //thêm sản phâm vaog giỏ hàng
                cart.products.push({ productId, quantity })
            }

        }
        else {
            cart = new Cart({
                userId: req.user._id,
                products: [{ productId, quantity }]
            })

        }
        await cart.save();
        res.status(200).json({ data: cart, success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}

//Cập nhật giỏ hàng
const updateCart = async (req, res) => {
    const { productId, quantity } = req.body
    if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    try {
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(200).json({ message: "Product not found" })
        }
        //kiểm tra xem có vươt số lượng trong kho ko
        if (quantity > product.quantity) {
            return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
        }

        const cart = await Cart.findOne({ userId: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId)

        if (productIndex > -1) {
            // Nếu sản phẩm tồn tại, cập nhật số lượng
            cart.products[productIndex].quantity = quantity
            await cart.save()
            res.status(200).json({ data: cart, success: true });
        } else {
            // Nếu sản phẩm không có trong giỏ hàng
            res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//lấy giỏ hàng ng dùng
const getUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate({
                path: 'products.productId',
                select: 'name price images'
            })
            console.log(cart)
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' })
        }

        res.status(200).json({ data: cart, success: true })

    } catch (err) {
        res.status(500).json({ error: err })
    }

}

//Xóa sản phẩm khỏi giỏ hàng
const deleteProductFromCart = async (req, res) => {
    const { productId } = req.params
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.products = cart.products.filter(p => p.productId.toString() !== productId);
        await cart.save();
        res.status(200).json(cart);

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

}

//Xóa tất cả sản phẩm
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
        console.log(cart)
        if (!cart) {
            return res.status(400).json({ message: "Cart not found" })
        }
        cart.products = []
        await cart.save()
        res.status(200).json({ message: 'Cart cleared successfully', success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = {
    addToCart,
    getUserCart,
    deleteProductFromCart,
    clearCart,
    updateCart
}