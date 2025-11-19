const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
// In production (Vercel), use environment variables directly
// In development, load from .env file
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '..', '.env');
  console.log('Loading .env from:', envPath);
  const envResult = dotenv.config({ path: envPath });

  if (envResult.error) {
    console.error('Error loading .env file:', envResult.error);
  } else {
    console.log('Environment variables loaded successfully');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  }
} else {
  console.log('Running in production mode - using environment variables from host');
}

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (Organized alphabetically for maintainability)
app.use('/api/auth', require('./routes/auth'));                           // Authentication
app.use('/api/colleges', require('./routes/colleges'));                   // College management
app.use('/api/coordinators', require('./routes/coordinators'));           // Coordinator management
app.use('/api/dashboard', require('./routes/dashboard'));                 // Dashboard statistics
app.use('/api/event-registrations', require('./routes/eventRegistrations')); // Event registrations
app.use('/api/events', require('./routes/events'));                       // Event management
app.use('/api/leads', require('./routes/leads'));                         // Lead management
app.use('/api/participants', require('./routes/participants'));           // Participant management
app.use('/api/registrations', require('./routes/registrations'));         // Registration management
app.use('/api/reports', require('./routes/reports'));                     // Reports & analytics
app.use('/api/teams', require('./routes/teams'));                         // Team management

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
