const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user._id }).sort({ type: 1, name: 1 });

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories'
        });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category'
        });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    try {
        const category = await Category.create({
            ...req.body,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }
        
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating category'
        });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    try {
        let category = await Category.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }
        
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating category'
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has transactions
        const transactionCount = await Transaction.countDocuments({
            category: req.params.id,
            user: req.user._id
        });

        if (transactionCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing transactions'
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Category deleted successfully',
            data: {}
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting category'
        });
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};