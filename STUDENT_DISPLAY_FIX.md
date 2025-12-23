# Quick Fix for Student Name/Email Display Issue

## Problem
Admin panel shows "No name" and "No email" for all students even though data exists in database.

## Root Cause
The `profilesDB.getById()` is not finding profiles because:
1. Student `user_id` might not match Profile `_id`
2. Backend API might not be returning the profile correctly

## Solution Steps

### 1. Verify Data in MongoDB
Open MongoDB and check:
```javascript
// Check if students have valid user_id
db.students.find()

// Check if profiles exist
db.profiles.find({ role: 'student' })

// Verify the IDs match
```

### 2. Re-seed Database
The seed data might have mismatched IDs. Run:
```bash
cd backend
npm run seed
```

### 3. Fix Frontend Code
Update AdminPanel.tsx with better error handling and logging.

## Testing
1. Stop backend server
2. Run `cd backend && npm run seed`
3. Start backend `cd backend && npm run dev`
4. Refresh frontend
5. Check Admin Panel - students should show names/emails
