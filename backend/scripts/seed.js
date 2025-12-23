const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const Student = require('../models/Student');
const Company = require('../models/Company');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-career-portal';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Profile.deleteMany({});
        await Student.deleteMany({});
        await Company.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create demo users
        const superAdmin = await Profile.create({
            name: 'Super Admin',
            email: 'blue67388@gmail.com',
            password: 'superadmin@123',
            role: 'super_admin'
        });

        const admin = await Profile.create({
            name: 'Admin User',
            email: 'achu73220@gmail.com',
            password: 'admin@123',
            role: 'admin'
        });

        const staff = await Profile.create({
            name: 'Staff Member',
            email: 'staff@example.com',
            password: 'staff123',
            role: 'staff'
        });

        const student = await Profile.create({
            name: 'John Student',
            email: 'student@example.com',
            password: 'student123',
            role: 'student'
        });

        console.log('👤 Created demo users');

        // Create student record for student user
        await Student.create({
            user_id: student._id,
            resume_status: 'pending',
            registration_number: 'STU2024001'
        });

        console.log('🎓 Created student record');

        // Create sample companies
        await Company.create({
            name: 'Tech Corp',
            description: 'Leading technology company',
            location: 'San Francisco, CA',
            deadline: '2024-12-31',
            posted_by: staff._id,
            positions: ['Software Engineer', 'Data Analyst'],
            requirements: ['Bachelor\'s degree', '2+ years experience']
        });

        await Company.create({
            name: 'Innovation Labs',
            description: 'Innovative startup',
            location: 'New York, NY',
            deadline: '2024-11-30',
            posted_by: admin._id,
            positions: ['Frontend Developer', 'UI/UX Designer'],
            requirements: ['Portfolio required', 'React experience']
        });

        console.log('🏢 Created sample companies');

        console.log('\n✅ Seed data created successfully!');
        console.log('\nDemo Credentials:');
        console.log('Super Admin: blue67388@gmail.com / superadmin@123');
        console.log('Admin: achu73220@gmail.com / admin@123');
        console.log('Staff: staff@example.com / staff123');
        console.log('Student: student@example.com / student123');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
