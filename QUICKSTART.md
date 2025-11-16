# Quick Start Guide

## Step-by-Step Setup

### 1. Make sure MongoDB is running

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
mongod
```

Or use MongoDB Atlas (cloud) and update the MONGODB_URI in `.env`

### 2. Create an Admin User

Run the following command to create a default admin user:

```bash
npm run create-admin
```

This will create:
- Email: `admin@example.com`
- Password: `password123`

### 3. Start the Application

Run both frontend and backend:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and go to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 5. Login

Use the credentials:
- Email: `admin@example.com`
- Password: `password123`

## Troubleshooting

### If MongoDB is not installed:

**Windows:**
Download from: https://www.mongodb.com/try/download/community

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
```

### If ports are already in use:

- Backend (5000): Change `PORT` in `.env`
- Frontend (5173): Vite will suggest an alternative port

### If dependencies are missing:

```bash
npm install
cd client
npm install
```

## What's Next?

After logging in, you'll see:
- 📊 Dashboard with statistics
- 📋 Recent activity feed
- ⚡ Quick action buttons
- 👤 User profile information

You can customize the dashboard by editing:
- `client/src/pages/Dashboard.jsx`

Add new routes by editing:
- `client/src/App.jsx`

Add new API endpoints in:
- `server/routes/`
