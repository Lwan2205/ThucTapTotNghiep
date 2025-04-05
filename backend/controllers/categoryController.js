const Category = require("../models/category")

//thêm danh mục
const addCategory = async (req, res) => {

    const { name, slug, description, isFeatured } = req.body


    if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" })
    }
    try {
        const category = await Category.create({
            name,
            slug,
            description,
            isFeatured
        })
        res.status(201).json({ message: "Add category successfully", data: category })

    }
    catch (err) {
        res.status(401).json({ error: err })

    }
}

//lấy tât cả danh mục
const getAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find()

        res.status(201).json({ data: allCategories })
    }
    catch (error) {
        res.status(400).json({ error: error })

    }


}

// Lấy danh mục theo ID
const getCategoryByID = async (req, res) => {

    try {
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(400).json({ message: "Category not found" })
        }

        res.status(200).json({ success: true, data: category })

    }
    catch (err) {
        res.status(401).json({ error: err })
    }

}


//sửa danh mục

const updateCategory = async (req, res) => {
    const { name, slug, description } = req.body
    try {
        const category = await Category.findById(req.params.id)

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = name || category.name
        category.slug = slug || category.slug
        category.description || category.description

        const updateCategory = await category.save()

        res.status(201).json({ success: true, message: "Update categories succesfully", data: updateCategory })


    }
    catch (err) {
        res.status(400).json({ error: err })
    }
}

//xóa danh mục

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        if (!category) {
            return res.status(404).json({ message: 'Category not exits' });
        }

        res.status(200).json({ success: true, message: "Delete category successfully" })
    }
    catch (err) {
        res.status(400).json({ error: err })
    }
}

module.exports = {
    addCategory,
    getAllCategories,
    getCategoryByID,
    updateCategory,
    deleteCategory
}