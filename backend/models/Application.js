const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending'
    },
    applied_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create index for faster queries
applicationSchema.index({ student_id: 1, company_id: 1 }, { unique: true });
applicationSchema.index({ company_id: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
