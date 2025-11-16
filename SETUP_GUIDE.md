# 🎉 Mahotsav Admin Portal - Complete Setup Guide

## 📋 Overview
This is a production-ready Admin Portal for managing Mahotsav (College Festival) registrations, events, participants, and statistics with an optimized database structure and comprehensive dashboard.

---

## 🗄️ **DATABASE STRUCTURE**

### **Collections:**

#### 1️⃣ **Users (Students)**
```javascript
{
  fullName: String,          // Student's full name
  dob: Date,                 // Date of birth
  gender: String,            // 'Male', 'Female', 'Other'
  collegeName: String,       // College name
  registerId: String,        // College registration ID
  email: String,             // Email (unique)
  mobile: String,            // Mobile number
  password: String,          // Hashed password
  mahotsavId: String,        // Auto-generated: MH26XXXXXX
  role: String,              // 'admin', 'student', 'user'
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

#### 2️⃣ **Colleges**
```javascript
{
  collegeName: String,       // College name (unique)
  district: String,          // District
  state: String,             // State
  totalRegistrations: Number,// Auto-calculated count
  university: String,        // Optional
  type: String,              // Optional
  website: String,           // Optional
  contactEmail: String,      // Optional
  contactPhone: String,      // Optional
  isActive: Boolean,         // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

#### 3️⃣ **Events**
```javascript
{
  eventName: String,         // Event name
  eventId: String,           // Unique event ID (e.g., SP001, CL001)
  category: String,          // 'sports' or 'cultural'
  eventType: String,         // 'team' or 'individual'
  maxTeamSize: Number,       // Maximum team members
  minTeamSize: Number,       // Minimum team members
  description: String,       // Event description
  rules: String,             // Event rules
  malesFee: Number,          // Registration fee for males
  femalesFee: Number,        // Registration fee for females
  status: String,            // 'active', 'inactive', 'completed'
  coordinatorName: String,   // Coordinator details
  coordinatorEmail: String,
  coordinatorPhone: String,
  venue: String,             // Event venue
  date: String,              // Event date
  time: String,              // Event time
  createdAt: Date,
  updatedAt: Date
}
```

#### 4️⃣ **Registrations**
```javascript
{
  userId: ObjectId,          // Reference to User
  eventId: ObjectId,         // Reference to Event
  teamName: String,          // Team name (for team events)
  membersCount: Number,      // Number of team members
  teamMembers: [             // Array of team members
    {
      userId: ObjectId,
      name: String,
      role: String           // 'captain' or 'member'
    }
  ],
  isTeamCaptain: Boolean,    // Is this user team captain?
  amountPaid: Number,        // Amount paid
  paymentStatus: String,     // 'pending', 'paid', 'failed', 'refunded'
  transactionId: String,     // Payment transaction ID
  registrationStatus: String,// 'pending', 'approved', 'rejected', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 **SETUP INSTRUCTIONS**

### **Prerequisites:**
- Node.js v18+ 
- MongoDB Atlas account or local MongoDB
- Git

### **Installation Steps:**

1️⃣ **Clone and Install Dependencies**
```bash
# Navigate to project folder
cd D:\documents\Desktop\AdminPortal

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2️⃣ **Configure Environment Variables**
Create/Update `.env` file in root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
PORT=5000
```

3️⃣ **Database Setup**

**Option A: Seed Sample Data (Recommended for Testing)**
```bash
cd server
node seed-data.js
```
This creates:
- 5 sample colleges
- 5 sample users with auto-generated Mahotsav IDs
- 8 sample events (4 sports, 4 cultural)
- Sample registrations

**Option B: Migrate Existing Data**
```bash
cd server
node migrate-data.js
```
This migrates your existing data to the new optimized schema.

4️⃣ **Start the Application**

**Terminal 1 - Backend:**
```bash
cd server
npm start
# or
node server.js
```
Server runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on: `http://localhost:5173`

5️⃣ **Access the Application**
- Open browser: `http://localhost:5173`
- Login with admin credentials from your database

---

## 📊 **DASHBOARD STATISTICS API**

### **Endpoint:** `GET /api/dashboard/statistics`

### **Response Structure:**
```javascript
{
  success: true,
  data: {
    // Overview
    totalUsers: Number,
    totalColleges: Number,
    totalEvents: Number,
    totalRegistrations: Number,
    
    // Sports Statistics
    sports: {
      teamEvents: Number,
      individualEvents: Number,
      totalParticipants: Number
    },
    
    // Cultural Statistics
    cultural: {
      teamEvents: Number,
      individualEvents: Number,
      totalParticipants: Number
    },
    
    // Gender Breakdown
    gender: {
      male: Number,
      female: Number,
      other: Number
    },
    
    // College-wise Data
    colleges: [
      {
        collegeName: String,
        registrations: Number,
        participants: Number
      }
    ],
    
    // Payment Statistics
    payment: {
      paid: Number,
      pending: Number,
      failed: Number,
      totalRevenue: Number
    },
    
    // Recent Activity
    recentActivity: [
      {
        userName: String,
        mahotsavId: String,
        collegeName: String,
        eventName: String,
        category: String,
        teamName: String,
        paymentStatus: String,
        registeredAt: Date
      }
    ],
    
    // Registration Trends
    registrationTrends: [
      {
        date: String,
        count: Number
      }
    ]
  }
}
```

### **Additional Endpoints:**
- `GET /api/dashboard/quick-stats` - Quick overview stats
- `GET /api/dashboard/event-stats` - Event-specific statistics

---

## 📁 **PROJECT STRUCTURE**

```
AdminPortal/
├── server/
│   ├── models/
│   │   ├── User.js          ✅ Optimized with mahotsavId auto-generation
│   │   ├── College.js       ✅ Optimized with auto-count
│   │   ├── Event.js         ✅ Optimized with category/eventType
│   │   └── Registration.js  ✅ Optimized with references
│   ├── routes/
│   │   ├── dashboard.js     ✅ NEW: Complete dashboard API
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── reports.js
│   │   └── ...
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── db.js
│   ├── migrate-data.js      ✅ Data migration script
│   ├── seed-data.js         ✅ Sample data seeding
│   └── server.js            ✅ Updated with dashboard routes
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Events.jsx
│   │   │   └── ...
│   │   ├── api.js           ✅ Updated with dashboardAPI
│   │   └── ...
│   └── ...
└── .env
```

---

## ✅ **FEATURES IMPLEMENTED**

### **Database Models:**
✅ User model with auto-generated Mahotsav ID (MH26XXXXXX)  
✅ College model with auto-calculated registration counts  
✅ Event model with proper category (sports/cultural) and type (team/individual)  
✅ Registration model with proper references and team support  

### **API Endpoints:**
✅ Complete dashboard statistics endpoint  
✅ Quick stats for dashboard cards  
✅ Event-specific statistics  
✅ Proper indexing for fast queries  

### **Helper Scripts:**
✅ Data migration script for existing data  
✅ Sample data seeding script for testing  

### **Frontend Integration:**
✅ Dashboard API integrated in api.js  
✅ Backward compatible with existing endpoints  

---

## 🔧 **COMMON COMMANDS**

```bash
# Restart backend
cd server
npm start

# Restart frontend
cd client
npm run dev

# Reseed database (careful: deletes existing data)
cd server
node seed-data.js

# Migrate existing data
cd server
node migrate-data.js

# Check database collections
cd server
node check-collections.js
```

---

## 📝 **MIGRATION NOTES**

### **Breaking Changes:**
1. `Event.eventType` now means 'team' or 'individual' (was 'sports'/'cultural')
2. `Event.category` now stores 'sports' or 'cultural'
3. `User.name` renamed to `User.fullName`
4. `College.name` renamed to `College.collegeName`

### **Backward Compatibility:**
- Virtual fields added for `isTeamEvent` and `teamSize`
- Old endpoints still work with existing data
- Migration script handles data transformation

---

## 🎯 **NEXT STEPS**

1. ✅ Run `seed-data.js` to create sample data
2. ✅ Update Dashboard.jsx to use new `dashboardAPI`
3. ✅ Test all endpoints with Postman/Thunder Client
4. ✅ Update college district/state information manually
5. ✅ Configure payment gateway integration
6. ✅ Set up email notifications
7. ✅ Deploy to production server

---

## 📞 **SUPPORT**

For any issues or questions:
- Check logs in terminal
- Verify MongoDB connection
- Ensure all dependencies are installed
- Check .env configuration

---

## 🎉 **SUCCESS INDICATORS**

✅ Server running on port 5000  
✅ Frontend running on port 5173  
✅ MongoDB connected successfully  
✅ Dashboard shows statistics  
✅ All CRUD operations working  
✅ Mahotsav IDs auto-generating  

---

**Last Updated:** November 15, 2025  
**Version:** 2.0.0 (Optimized)
