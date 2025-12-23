const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Get all profiles
router.get('/', async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const profiles = await Profile.find(query).select('-password');
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id).select('-password');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create profile
router.post('/', async (req, res) => {
    try {
        const profile = new Profile(req.body);
        await profile.save();
        const { password, ...profileData } = profile.toObject();
        res.status(201).json(profileData);
    } catch (error) {
        res.status(400).json({ message: 'Error creating profile', error: error.message });
    }
});

// Update profile
router.put('/:id', async (req, res) => {
    try {
        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(400).json({ message: 'Error updating profile', error: error.message });
    }
});

// Delete profile
router.delete('/:id', async (req, res) => {
    try {
        const profile = await Profile.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting profile', error: error.message });
    }
});

// Count profiles by role
router.get('/count/:role', async (req, res) => {
    try {
        const count = await Profile.countDocuments({ role: req.params.role });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
