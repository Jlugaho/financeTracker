const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
        maxlength: [30, 'Category name cannot be more than 30 characters']
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    color: {
        type: String,
        default: '#3B82F6',
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please add a valid hex color']
    },
    icon: {
        type: String,
        default: '💰'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate categories per user
categorySchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);