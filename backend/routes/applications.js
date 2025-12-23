const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Profile = require('../models/Profile');

// Create new application
router.post('/', async (req, res) => {
    try {
        const { student_id, company_id } = req.body;

        // Check if application already exists
        const existingApplication = await Application.findOne({ student_id, company_id });
        if (existingApplication) {
            return res.status(400).json({ message: 'Already applied to this company' });
        }

        const application = new Application({
            student_id,
            company_id,
            status: 'pending'
        });

        await application.save();
        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all applications
router.get('/', async (req, res) => {
    try {
        const applications = await Application.find()
            .populate({
                path: 'student_id',
                populate: {
                    path: 'user_id',
                    model: 'Profile'
                }
            })
            .populate('company_id')
            .sort({ applied_at: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get applications by student
router.get('/student/:studentId', async (req, res) => {
    try {
        const applications = await Application.find({ student_id: req.params.studentId })
            .populate('company_id')
            .sort({ applied_at: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get applications by company
router.get('/company/:companyId', async (req, res) => {
    try {
        const applications = await Application.find({ company_id: req.params.companyId })
            .populate('student_id')
            .sort({ applied_at: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get application statistics
router.get('/stats', async (req, res) => {
    try {
        const totalApplications = await Application.countDocuments();
        const pendingApplications = await Application.countDocuments({ status: 'pending' });
        const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
        const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

        // Get top companies by application count
        const topCompanies = await Application.aggregate([
            {
                $group: {
                    _id: '$company_id',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            total: totalApplications,
            pending: pendingApplications,
            accepted: acceptedApplications,
            rejected: rejectedApplications,
            topCompanies
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update application status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete application
router.delete('/:id', async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
