const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// Get all companies
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find().populate('posted_by', 'name email');
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get company by ID
router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).populate('posted_by', 'name email');
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create company
router.post('/', async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).json(company);
    } catch (error) {
        res.status(400).json({ message: 'Error creating company', error: error.message });
    }
});

// Update company
router.put('/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(company);
    } catch (error) {
        res.status(400).json({ message: 'Error updating company', error: error.message });
    }
});

// Delete company
router.delete('/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting company', error: error.message });
    }
});

module.exports = router;
