# MongoDB Sample Data Import Guide

This directory contains sample JSON data files for importing into MongoDB.

## Files

- `profiles.json` - 6 user profiles (1 super_admin, 1 admin, 2 staff, 2 students)
- `students.json` - 2 student records linked to student profiles
- `companies.json` - 3 company job postings

## Method 1: Using mongoimport (Command Line)

### Prerequisites
- MongoDB must be running
- Database: `student-career-portal`

### Import Commands

```bash
# Navigate to the sample-data directory
cd backend/sample-data

# Import profiles
mongoimport --db student-career-portal --collection profiles --file profiles.json --jsonArray

# Import students
mongoimport --db student-career-portal --collection students --file students.json --jsonArray

# Import companies
mongoimport --db student-career-portal --collection companies --file companies.json --jsonArray
```

## Method 2: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Create/Select database: `student-career-portal`
4. For each collection (profiles, students, companies):
   - Click "ADD DATA" → "Import JSON or CSV file"
   - Select the corresponding JSON file
   - Click "Import"

## Method 3: Using the Seed Script (Recommended)

The easiest way is to use the provided seed script:

```bash
cd backend
npm run seed
```

This automatically clears existing data and creates fresh demo data.

## Demo Login Credentials

After importing, you can login with:

- **Super Admin**: blue67388@gmail.com / superadmin@123
- **Admin**: achu73220@gmail.com / admin@123  
- **Staff**: staff@example.com / staff123
- **Student**: student@example.com / student123

## Verify Import

After importing, verify the data:

```bash
mongosh
use student-career-portal
db.profiles.find()
db.students.find()
db.companies.find()
```

Or check counts:
```bash
db.profiles.countDocuments()
db.students.countDocuments()
db.companies.countDocuments()
```

Expected counts:
- profiles: 6
- students: 2
- companies: 3
