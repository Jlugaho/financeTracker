const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;
        
        // Build filter object
        let filter = { user: req.user._id };
        
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(filter)
            .populate('category', 'name type color icon')
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments(filter);

        res.json({
            success: true,
            count: transactions.length,
            total,
            pages: Math.ceil(total / limit),
            data: transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching transactions'
        });
    }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('category', 'name type color icon');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching transaction'
        });
    }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    try {
        // Verify category exists and belongs to user
        const category = await Category.findOne({
            _id: req.body.category,
            user: req.user._id
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Verify transaction type matches category type
        if (category.type !== req.body.type) {
            return res.status(400).json({
                success: false,
                message: 'Transaction type must match category type'
            });
        }

        const transaction = await Transaction.create({
            ...req.body,
            user: req.user._id
        });

        // Populate category before sending response
        await transaction.populate('category', 'name type color icon');

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating transaction'
        });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // If category is being updated, verify it exists and belongs to user
        if (req.body.category) {
            const category = await Category.findOne({
                _id: req.body.category,
                user: req.user._id
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Verify transaction type matches category type
            if (category.type !== (req.body.type || transaction.type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction type must match category type'
                });
            }
        }

        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category', 'name type color icon');

        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating transaction'
        });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await Transaction.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Transaction deleted successfully',
            data: {}
        });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting transaction'
        });
    }
};

// @desc    Get financial summary
// @route   GET /api/transactions/summary
// @access  Private
const getFinancialSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = { user: req.user._id };
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(dateFilter).populate('category');

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Category-wise breakdown
        const categoryBreakdown = transactions.reduce((acc, transaction) => {
            const categoryName = transaction.category.name;
            if (!acc[categoryName]) {
                acc[categoryName] = {
                    amount: 0,
                    type: transaction.type,
                    color: transaction.category.color
                };
            }
            acc[categoryName].amount += transaction.amount;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                totalIncome,
                totalExpenses,
                balance,
                categoryBreakdown,
                transactionCount: transactions.length
            }
        });
    } catch (error) {
        console.error('Financial summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating financial summary'
        });
    }
};

module.exports = {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary
};