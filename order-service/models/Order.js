const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User ID is required"]
    },
    productId: {
        type: String,
        required: [true, "Product ID is required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"]
    },
    status: {
        type: String,
        default: "Pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
