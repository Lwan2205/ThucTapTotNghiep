const Product = require("../models/product")
const Category = require("../models/category")

//lấy sản phẩm theo danh mục

const getProductbyCategoryID = async (req, res) => {
    const { categoryID } = req.params
    try {
        const product = await Product.find({ category: categoryID })
        if (!product) {
            return res.status(400).json({ message: "Product not found" })
        }

        res.status(200).json({ success: true, data: product })

    }
    catch (err) {
        res.status(400).json({ error: err })
    }
}

//lây chi tiêt sản phẩm
const getProductByID = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ data: product, success: true });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

// thêm sản phẩm

const addProduct = async (req, res) => {
    const { name, color, description, price, quantity, category, tags } = req.body
    const imageUrl = req.file ? req.file.path : null;


    if (!name || !description || !price || !quantity || !category || !tags) {
        return res.status(400).json({ message: "Require complete input" })
    }
    try {
        const foundCategory = await Category.findById(category)
        console.log(foundCategory)
        if (!foundCategory) {
            return res.status(401).json({ message: "Category not found" })
        }

        const product = new Product({
            name,
            color,
            description,
            price,
            quantity,
            images: imageUrl,
            category,
            tags
        })
        const createProduct = await product.save()

        res.status(200).json({ message: "Add products succesfully", data: createProduct })
    }
    catch (err) {

        res.status(500).json({ message: "Server error", error: err.message });
    }
}
// const addProduct = async (req, res) => {
//     try {
//         console.log("🔹 Body nhận được từ client:", req.body);

//         const { name, color, description, price, quantity, category, tags, images } = req.body;

//         // Kiểm tra các trường bắt buộc
//         if (!name || !description || !price || !quantity || !category || !tags || !images) {
//             console.log("❌ Thiếu thông tin đầu vào");
//             return res.status(400).json({ message: "Require complete input" });
//         }

//         // Kiểm tra danh mục có tồn tại không
//         const foundCategory = await Category.findById(category);
//         console.log("🔹 Kết quả tìm category:", foundCategory);
//         if (!foundCategory) {
//             console.log("❌ Category không tồn tại");
//             return res.status(401).json({ message: "Category not found" });
//         }

//         // Tạo sản phẩm mới
//         const product = new Product({
//             name,
//             color,
//             description,
//             price,
//             quantity,
//             images,  // Chỉ lưu URL hình ảnh
//             category,
//             tags
//         });

//         const createProduct = await product.save();
//         console.log("✅ Sản phẩm đã được tạo:", createProduct);

//         res.status(200).json({ message: "Add products successfully", data: createProduct });
//     } catch (err) {
//         console.error("🔥 Lỗi server:", err.message);
//         res.status(500).json({ message: "Server error", error: err.message });
//     }
// };


//lây tât ca sản phẩm
const getAllProduct = async (req, res) => {
    try {
        // Lấy thông số phân trang từ query
        const page = parseInt(req.query.page) || 1;  // Trang hiện tại, mặc định là trang 1
        const limit = parseInt(req.query.limit) || 100;  // Số sản phẩm mỗi trang, mặc định là 20

        const products = await Product.find()
            .skip((page - 1) * limit)  // Bỏ qua (page - 1) * limit sản phẩm
            .limit(limit);  // Giới hạn số lượng sản phẩm

        const totalProducts = await Product.countDocuments();  // Tổng số sản phẩm

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                totalProducts,
                totalPages: Math.ceil(totalProducts / limit),  // Số trang
            },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


//sửa sản phẩm

const updateProduct = async (req, res) => {
    const { name, color, description, price, quantity, category, tags } = req.body


    try {
        const product = await Product.findById(req.params.id)
        console.log(product)
        if (!product) {
            return res.status(400).json({ message: "Product not found" })
        }

        product.name = name || product.name,
            product.color = color || product.color,
            product.description = description || product.description,
            product.price = price || product.price,
            product.quantity = quantity || product.quantity,
            product.category = category || product.category,
            product.tags = tags || product.tags
        if (req.file) {
            product.images = req.file.path;
            console.log(product.images)
        }

        const updateProduct = await product.save()
        console.log(updateProduct)

        res.status(201).json({ message: "Update product successfully", data: updateProduct })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
}
// const updateProduct = async (req, res) => {
//     const { name, color, description, price, quantity, category, tags, images } = req.body;

//     try {
//         const product = await Product.findById(req.params.id);
//         if (!product) {
//             return res.status(400).json({ message: "Product not found" });
//         }

//         product.name = name || product.name;
//         product.color = color || product.color;
//         product.description = description || product.description;
//         product.price = price || product.price;
//         product.quantity = quantity || product.quantity;
//         product.category = category || product.category;
//         product.tags = tags || product.tags;

//         // Cập nhật ảnh bằng URL
//         if (images) {
//             product.images = images; // Nhận URL trực tiếp từ request body
//             console.log("Updated image URL:", product.images);
//         }

//         const updatedProduct = await product.save();

//         res.status(200).json({ message: "Update product successfully", data: updatedProduct });
//     } catch (err) {
//         res.status(400).json({ error: err.message || "An error occurred" });
//     }
// };


//xóa sản phẩm

const deleteProduct = async (req, res) => {

    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) {
            return res.status(400).json({ message: "Product not found" })
        }
        res.status(200).json({ success: true, message: "Delete product successfully" })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
}

module.exports = ({
    addProduct,
    getProductByID,
    getProductbyCategoryID,
    getAllProduct,
    updateProduct,
    deleteProduct
})