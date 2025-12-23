const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await Profile.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Simple password check (in production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user data (excluding password)
        const { password: _, ...userData } = user.toObject();
        res.json({ user: userData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Logout (client-side handles session clearing)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
