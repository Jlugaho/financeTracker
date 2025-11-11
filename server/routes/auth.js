const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .withMessage('Please include a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please include a valid email'),
    body('password')
        .exists()
        .withMessage('Password is required')
];

router.post('/register', registerValidation, handleValidationErrors, registerUser);
router.post('/login', loginValidation, handleValidationErrors, loginUser);
router.get('/me', protect, getMe);

module.exports = router;