const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    resume_url: { type: String, default: null },
    resume_status: { type: String, default: 'pending' },
    registration_number: { type: String, default: null },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
