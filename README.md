# Student Career Portal - Setup Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Software Installation](#software-installation)
- [Project Setup](#project-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before setting up this project on your new laptop, you need to install the following software:

### 1. **Node.js and npm**
- **Version**: Node.js 18.x or higher
- **Download**: [https://nodejs.org/](https://nodejs.org/)
- **Verify Installation**:
  ```bash
  node --version  # Should show v18.x.x or higher
  npm --version   # Should show 9.x.x or higher
  ```

### 2. **MongoDB**
- **Version**: MongoDB 6.x or higher
- **Download**: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Verify Installation**:
  ```bash
  mongod --version
  ```

### 3. **Git**
- **Download**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Verify Installation**:
  ```bash
  git --version
  ```

### 4. **Code Editor**
- **Recommended**: Visual Studio Code
- **Download**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## 💻 Software Installation

### Windows Setup

1. **Install Node.js**:
   - Download the Windows installer from nodejs.org
   - Run installer and follow the wizard
   - Restart your terminal after installation

2. **Install MongoDB**:
   - Download MongoDB Community Server
   - Run installer, choose "Complete" installation
   - Install MongoDB as a Windows Service
   - Start MongoDB service from Services panel

3. **Install Git**:
   - Download Git for Windows
   - Use default settings during installation

### macOS Setup

```bash
# Using Homebrew (install Homebrew first from https://brew.sh/)
brew install node
brew install mongodb-community
brew install git
```

### Linux (Ubuntu/Debian) Setup

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Git
sudo apt-get install git
```

---

## 🚀 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kalai66/student-career-portal-16.git
cd student-career-portal-16
```

### 2. Install Frontend Dependencies

```bash
# Install all npm packages
npm install
```

### 3. Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install backend packages
npm install

# Return to root directory
cd ..
```

---

## ⚙️ Configuration

### 1. MongoDB Setup

Make sure MongoDB is running:

**Windows**:
```bash
# MongoDB should auto-start as a service
# Check status in Services panel
```

**macOS/Linux**:
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Connection String**:
The default MongoDB connection is: `mongodb://localhost:27017/student-career-portal`

### 2. Environment Variables (Optional)

Create a `.env` file in the `backend` folder if you need custom configuration:

```env
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-career-portal
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
# From project root, navigate to backend
cd backend

# Start the backend server
node server.js
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
```

### Start Frontend Development Server

Open a **new terminal** window:

```bash
# From project root
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to:
- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 👥 Default User Accounts

### Super Admin
- **Email**: `superadmin@example.com`
- **Password**: `superadmin123`
- **Role**: Super Admin (manages all staff)

### Admin
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: Admin (manages students and applications)

### Staff
- **Email**: `staff@example.com`
- **Password**: `staff123`
- **Role**: Staff (manages students and companies)

### Student
- **Email**: `student@example.com`
- **Password**: `student123`
- **Role**: Student (applies to companies)

---

## 🏗️ Project Structure

```
student-career-portal-16/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── server.js        # Backend entry point
├── src/
│   ├── components/      # React components
│   ├── lib/            # Utilities and helpers
│   └── main.tsx        # Frontend entry point
├── index.html
├── package.json
└── README.md
```

---

## 🔍 Features

- **User Management**: Super Admin, Admin, Staff, and Student roles
- **Student Management**: Add, edit, delete students
- **Company Management**: Manage company listings
- **Application Tracking**: Students apply to companies, track status
- **Resume Management**: Upload and verify student resumes
- **Print Reports**: Print student lists and application reports

---

## 🛠️ Troubleshooting

### MongoDB Connection Error

**Problem**: `MongoDB connection error`

**Solution**:
1. Check if MongoDB service is running
2. Verify connection string in `backend/server.js`
3. Ensure MongoDB is listening on port 27017

### Port Already in Use

**Problem**: `Port 5000 (or 8080) is already in use`

**Solution**:
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux - Find and kill process
lsof -i :5000
kill -9 <PID>
```

### npm install Errors

**Problem**: `npm ERR! code ENOENT` or dependency errors

**Solution**:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Frontend Not Loading

**Problem**: Blank page or errors in browser console

**Solution**:
1. Check browser console for errors
2. Ensure backend is running first
3. Clear browser cache and reload
4. Try incognito/private browsing mode

---

## 📝 Development Workflow

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test locally

3. Commit your changes:
   ```bash
   git add .
   git commit -m "FEAT: Description of your feature"
   ```

4. Push to repository:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

- `FEAT:` - New features
- `FIX:` - Bug fixes
- `DOCS:` - Documentation changes
- `REFACTOR:` - Code refactoring
- `STYLE:` - UI/styling changes

---

## 📞 Support

If you encounter any issues not covered in this guide:

1. Check existing GitHub issues
2. Create a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Error messages and screenshots
   - System information (OS, Node version, etc.)

---

## 📄 License

This project is for educational purposes.

---

## 🎉 You're All Set!

Your development environment is now ready. Start coding! 🚀
