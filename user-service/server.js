require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.USER_SERVICE_PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB UserDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

function validateUser(data) {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
        errors.name = "Name is required";
    }

    if (!data.email || data.email.trim() === "") {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Email must be valid";
    }

    return errors;
}

app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
             return res.status(404).json({ message: "User not found" });
        }
        
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/users", async (req, res) => {
    const errors = validateUser(req.body);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Validation failed",
                errors: { email: "Email must be unique" }
            });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put("/users/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(404).json({ message: "User not found" });
    }

    const errors = validateUser(req.body);

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors
        });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
         if (error.code === 11000) {
            return res.status(400).json({
                message: "Validation failed",
                errors: { email: "Email must be unique" }
            });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete("/users/:id", async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(404).json({ message: "User not found" });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`User Service running on port ${PORT}`);
});
