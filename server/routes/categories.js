const express = require('express');
const { body } = require('express-validator');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const categoryValidation = [
    body('name')
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ max: 30 })
        .withMessage('Category name cannot be more than 30 characters'),
    body('type')
        .isIn(['income', 'expense'])
        .withMessage('Type must be either income or expense'),
    body('color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Please provide a valid hex color'),
    body('icon')
        .optional()
        .isLength({ max: 5 })
        .withMessage('Icon cannot be more than 5 characters')
];

router.use(protect);

router.route('/')
    .get(getCategories)
    .post(categoryValidation, handleValidationErrors, createCategory);

router.route('/:id')
    .get(getCategory)
    .put(categoryValidation, handleValidationErrors, updateCategory)
    .delete(deleteCategory);

module.exports = router;