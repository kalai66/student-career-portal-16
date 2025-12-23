const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['student', 'staff', 'admin', 'super_admin']
    },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);
