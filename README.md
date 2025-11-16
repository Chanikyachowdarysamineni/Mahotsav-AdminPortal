# Admin Portal - MERN Stack with Tailwind CSS

A full-stack admin portal application built with MongoDB, Express, React, Node.js, and Tailwind CSS.

## Features

- 🔐 User Authentication (Login/Register)
- 🛡️ Protected Routes
- 📊 Dashboard with Statistics
- 🎨 Modern UI with Tailwind CSS
- 🔄 JWT Token-based Authentication

## 📁 Project Structure

```
AdminPortal/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Shared navigation component
│   │   │   └── ProtectedRoute.jsx  # Route protection wrapper
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page with animations
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   └── Reports.jsx         # Comprehensive reports page
│   │   ├── utils/
│   │   │   └── exportUtils.js      # PDF/Excel export utilities
│   │   ├── api.js                  # Axios configuration
│   │   ├── AuthContext.jsx         # Authentication context
│   │   ├── App.jsx                 # Main routing
│   │   └── main.jsx                # Entry point
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Registration.js         # Registration schema
│   │   ├── Event.js                # Event schema
│   │   └── Team.js                 # Team schema
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   └── reports.js              # Report API endpoints
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware
│   ├── createAdmin.js              # Admin creation script
│   ├── users.json                  # Sample user data
│   └── server.js                   # Express server
│
├── .env                            # Environment variables
├── package.json                    # Root package.json
└── README.md                       # This file
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone or navigate to the project
```bash
cd d:\documents\Desktop\AdminPortal
```

### 2. Install dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Your `.env` file should contain:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 4. Create Admin User
```bash
npm run create-admin
```

## 🚀 Running the Application

### Development Mode (Both servers simultaneously)
```bash
npm run dev
```

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 🔐 Login Credentials

Default admin credentials (after running `npm run create-admin`):
- **Email**: admin@example.com
- **Password**: admin123

Additional users are available in `server/users.json`.

## 📊 Database Collections

### users
- Stores admin and user credentials
- Fields: name, email, password (hashed), role

### registrations
- Participant registration data
- Fields: personal info, college details, events, payment info, team details

### events
- Event catalog
- Fields: eventId, eventName, category, fee, participant limits, status

### teams
- Team-based event participation
- Fields: teamId, teamName, captain, members, eventId, college

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Reports (All Protected)
- `GET /api/reports/statistics` - Overall statistics
- `GET /api/reports/gender-report` - Gender-based aggregation
- `GET /api/reports/college-report` - College-wise data
- `GET /api/reports/state-report` - State-wise data
- `GET /api/reports/event-report` - Event-wise analytics
- `GET /api/reports/team-report` - Team details
- `GET /api/reports/registrations` - Filtered registrations list
- `GET /api/reports/amount-report` - Revenue analysis

## 💾 Adding Data

You can add registrations, events, and teams directly through:

1. **MongoDB Compass**: Connect to your MongoDB Atlas cluster
2. **MongoDB Shell**: Use mongo shell commands
3. **API Endpoints**: Create POST endpoints for data entry
4. **Direct JSON Import**: Import JSON files to respective collections

### Sample Registration Document
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "gender": "Male",
  "college": "IIT Delhi",
  "state": "Delhi",
  "year": "3rd Year",
  "events": [
    {
      "eventId": "E001",
      "eventName": "Web Development Workshop"
    }
  ],
  "amountPaid": 500,
  "paymentStatus": "Paid",
  "transactionId": "TXN001"
}
```

### Payment Status Values
- `Pending` - Payment not completed
- `Paid` - Payment successful
- `Failed` - Payment failed
- `Refunded` - Payment refunded

### Gender Values
- `Male`
- `Female`
- `Other`
- `Physically Challenged`

## 📦 Dependencies

### Backend
- express@5.1.0
- mongoose@8.19.3
- jsonwebtoken@9.0.2
- bcryptjs@3.0.3
- cors@2.8.5
- dotenv@17.2.3

### Frontend
- react@19.1.1
- vite@7.2.1
- react-router-dom@7.9.5
- axios@1.13.2
- tailwindcss@3.4.1
- jspdf & jspdf-autotable (PDF export)
- xlsx & file-saver (Excel export)

## 🎨 UI Features

- **Gradient Backgrounds**: Modern color schemes
- **Smooth Animations**: Hover effects and transitions
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Visual feedback for async operations
- **Color-Coded Status**: Visual indicators for payment status
- **Interactive Tables**: Sortable and filterable data views

## 🔧 Troubleshooting

### Server won't start
- Check if MongoDB connection string is correct in `.env`
- Ensure port 5000 is not in use
- Verify all dependencies are installed

### Frontend shows blank page
- Hard refresh browser (Ctrl + F5)
- Check if backend server is running
- Clear browser cache

### Reports not loading
- Ensure backend server is running
- Check MongoDB connection
- Verify JWT token is valid (try logging in again)

### Export not working
- Check browser console for errors
- Ensure data is loaded before exporting
- Verify jsPDF and xlsx libraries are installed

## 🚀 Future Enhancements

- [ ] Form-based data entry for registrations
- [ ] Real-time dashboard updates
- [ ] Email notifications for registrations
- [ ] Payment gateway integration
- [ ] Bulk data import via CSV
- [ ] Advanced analytics charts
- [ ] User role management
- [ ] Audit logs and activity tracking

## 📝 License

This project is for educational/internal use.

---

**Built with ❤️ using MERN Stack**
