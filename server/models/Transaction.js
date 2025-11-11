const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [0.01, 'Amount must be greater than 0']
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true,
        maxlength: [100, 'Description cannot be more than 100 characters']
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound index for better query performance
transactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);