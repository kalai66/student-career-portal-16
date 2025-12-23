# Student Career Portal - Backend

Backend API server for Student Career Portal using Express.js and MongoDB.

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Create `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/student-career-portal
PORT=5000
```

3. **Start MongoDB**
Make sure MongoDB is running on your machine:
```bash
# Windows
net start MongoDB

# Or if using MongoDB Community Edition
mongod
```

4. **Seed Demo Data**
```bash
npm run seed
```

5. **Start Server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles?role=student` - Get profiles by role
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

## Demo Credentials

After running `npm run seed`:
- **Super Admin**: blue67388@gmail.com / superadmin@123
- **Admin**: achu73220@gmail.com / admin@123
- **Staff**: staff@example.com / staff123
- **Student**: student@example.com / student123
