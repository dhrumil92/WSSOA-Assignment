require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PRODUCT_SERVICE_PORT || 3002;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB ProductDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

function validateProduct(data) {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
        errors.name = "Product name is required";
    }

    if (data.price === undefined || data.price === null || isNaN(data.price) || Number(data.price) < 0) {
        errors.price = "Price must be a valid positive number";
    }

    return errors;
}

app.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/products/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
             return res.status(404).json({ message: "Product not found" });
        }
        
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/products", async (req, res) => {
    const errors = validateProduct(req.body);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    try {
        const newProduct = new Product({
            name: req.body.name,
            price: Number(req.body.price)
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put("/products/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(404).json({ message: "Product not found" });
    }

    const errors = validateProduct(req.body);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                price: Number(req.body.price)
            },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete("/products/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(404).json({ message: "Product not found" });
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Product Service running on port ${PORT}`);
});
