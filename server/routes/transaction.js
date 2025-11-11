const express = require('express');
const { body } = require('express-validator');
const {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const transactionValidation = [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
    body('type')
        .isIn(['income', 'expense'])
        .withMessage('Type must be either income or expense'),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 100 })
        .withMessage('Description cannot be more than 100 characters'),
    body('category')
        .isMongoId()
        .withMessage('Valid category ID is required'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Valid date is required')
];

router.use(protect);

router.route('/')
    .get(getTransactions)
    .post(transactionValidation, handleValidationErrors, createTransaction);

router.route('/summary')
    .get(getFinancialSummary);

router.route('/:id')
    .get(getTransaction)
    .put(transactionValidation, handleValidationErrors, updateTransaction)
    .delete(deleteTransaction);

module.exports = router;