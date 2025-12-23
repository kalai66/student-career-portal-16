const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    deadline: { type: String, required: true },
    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    positions: [{ type: String }],
    requirements: [{ type: String }],
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', companySchema);
