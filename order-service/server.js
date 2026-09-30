require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Order = require("./models/Order");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.ORDER_SERVICE_PORT || 3003;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB OrderDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/orders/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
             return res.status(404).json({ message: "Order not found" });
        }
        
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/orders", async (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid request data. userId, productId, and quantity (>=1) are required." });
    }

    try {
        // Validate User
        const userResponse = await fetch(`${USER_SERVICE_URL}/users/${userId}`);
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                return res.status(400).json({ message: "Validation failed: User not found" });
            }
            throw new Error('User Service Error');
        }

        // Validate Product
        const productResponse = await fetch(`${PRODUCT_SERVICE_URL}/products/${productId}`);
        if (!productResponse.ok) {
            if (productResponse.status === 404) {
                return res.status(400).json({ message: "Validation failed: Product not found" });
            }
            throw new Error('Product Service Error');
        }

        // Both dependencies are ok, create order
        const newOrder = new Order({
            userId,
            productId,
            quantity
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Order Creation Error:", error.message);
        // If error is related to fetch failing (network error, connection refused)
        // or we threw an error above for non-404 status codes:
        return res.status(503).json({ message: "Service Unavailable: Dependency could not be reached" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Order Service running on port ${PORT}`);
});
