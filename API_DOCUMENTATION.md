# 🚀 Admin Portal API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### 1. User Registration
- **POST** `/auth/register`
- **Public Access**
- **Body**: `{ name, email, password, role }`

### 2. User Login
- **POST** `/auth/login`
- **Public Access**
- **Body**: `{ email, password }`
- **Returns**: JWT token + user info

### 3. Get Current User
- **GET** `/auth/me`
- **Protected** (Requires token)
- **Returns**: Current user details

---

## 📊 Dashboard Endpoints

### 1. Complete Statistics
- **GET** `/dashboard/statistics`
- **Protected**
- **Returns**: 
  - Total users, colleges, events, registrations
  - Sports/Cultural breakdown
  - Gender statistics
  - College-wise data
  - Payment stats
  - Recent activity
  - Registration trends

### 2. Quick Stats
- **GET** `/dashboard/quick-stats`
- **Protected**
- **Returns**: Overview numbers

### 3. Event Statistics
- **GET** `/dashboard/event-stats`
- **Protected**
- **Returns**: Event-specific data with registration counts

---

## 🎪 Events Endpoints

### 1. Get All Events
- **GET** `/events`
- **Protected**
- **Returns**: List of all events

### 2. Get Single Event
- **GET** `/events/:id`
- **Protected**

### 3. Create Event
- **POST** `/events`
- **Protected** (Admin only)
- **Body**: Event details

### 4. Update Event
- **PUT** `/events/:id`
- **Protected** (Admin only)

### 5. Delete Event
- **DELETE** `/events/:id`
- **Protected** (Admin only)

---

## 🏫 Colleges Endpoints

### 1. Get All Colleges
- **GET** `/colleges`
- **Public Access**

### 2. Get Single College
- **GET** `/colleges/:id`
- **Public Access**

### 3. Create College
- **POST** `/colleges`
- **Protected** (Admin only)

### 4. Update College
- **PUT** `/colleges/:id`
- **Protected** (Admin only)

### 5. Delete College (Soft)
- **DELETE** `/colleges/:id`
- **Protected** (Admin only)

### 6. Search Colleges
- **GET** `/colleges/search/:query`
- **Public Access**

---

## 📝 Registrations Endpoints

### 1. Get All Registrations
- **GET** `/registrations`
- **Protected**

### 2. Get Single Registration
- **GET** `/registrations/:id`
- **Protected**

### 3. Create Registration
- **POST** `/registrations/register`
- **Public Access** (User registration)

### 4. Update Registration
- **PUT** `/registrations/:id`
- **Protected**

### 5. Delete Registration
- **DELETE** `/registrations/:id`
- **Protected**

### 6. Filter by Status
- **GET** `/registrations/status/:status`
- **Protected**

---

## 👥 Participants Endpoints

### 1. Get All Participants
- **GET** `/participants`
- **Protected**

### 2. Get Single Participant
- **GET** `/participants/:id`
- **Protected**

### 3. Register Participant
- **POST** `/participants/register`
- **Public Access**

### 4. Update Participant
- **PUT** `/participants/:id`
- **Protected**

### 5. Delete Participant
- **DELETE** `/participants/:id`
- **Protected**

### 6. Filter by Registration Status
- **GET** `/participants/status/:status`
- **Protected**

### 7. Filter by Payment Status
- **GET** `/participants/payment-status/:status`
- **Protected**

---

## 👨‍👩‍👧‍👦 Teams Endpoints

### 1. Get All Teams
- **GET** `/teams`
- **Protected**

### 2. Get Single Team
- **GET** `/teams/:id`
- **Protected**

### 3. Create Team
- **POST** `/teams/create`
- **Public Access**

### 4. Update Team
- **PUT** `/teams/:id`
- **Protected**

### 5. Delete Team
- **DELETE** `/teams/:id`
- **Protected**

### 6. Get Teams by Event
- **GET** `/teams/event/:eventId`
- **Protected**

### 7. Add Team Member
- **POST** `/teams/:id/add-member`
- **Public Access**

---

## 👔 Coordinators Endpoints

### 1. Get All Coordinators
- **GET** `/coordinators`
- **Protected** (Admin only)

### 2. Get Single Coordinator
- **GET** `/coordinators/:id`
- **Protected** (Admin only)

### 3. Create Coordinator
- **POST** `/coordinators`
- **Protected** (Admin only)

### 4. Update Coordinator
- **PUT** `/coordinators/:id`
- **Protected** (Admin only)

### 5. Delete Coordinator (Soft)
- **DELETE** `/coordinators/:id`
- **Protected** (Admin only)

### 6. Get by Department
- **GET** `/coordinators/department/:department`
- **Protected** (Admin only)

### 7. Record Login
- **POST** `/coordinators/:id/login`
- **Protected**

### 8. Record Logout
- **POST** `/coordinators/:id/logout`
- **Protected**

### 9. Record Collection
- **POST** `/coordinators/:id/collection`
- **Protected**
- **Body**: `{ amount }`

### 10. Increment Registrations
- **POST** `/coordinators/:id/registration-handled`
- **Protected**

### 11. Get Coordinator Stats
- **GET** `/coordinators/:id/stats`
- **Protected**

---

## 🎯 Leads Endpoints

### 1. Get All Leads
- **GET** `/leads`
- **Protected** (Admin only)

### 2. Get Single Lead
- **GET** `/leads/:id`
- **Protected** (Admin only)

### 3. Create Lead
- **POST** `/leads`
- **Protected** (Admin only)

### 4. Update Lead
- **PUT** `/leads/:id`
- **Protected** (Admin only)

### 5. Delete Lead
- **DELETE** `/leads/:id`
- **Protected** (Admin only)

### 6. Get by Role
- **GET** `/leads/role/:role`
- **Protected** (Admin only)

### 7. Search Leads
- **POST** `/leads/search`
- **Protected** (Admin only)
- **Body**: `{ searchTerm }`

---

## 🎫 Event Registrations Endpoints

### 1. Get Statistics Summary
- **GET** `/event-registrations/stats/summary`
- **Protected**

### 2. Get All Event Registrations
- **GET** `/event-registrations`
- **Protected**

### 3. Get Single Event Registration
- **GET** `/event-registrations/:id`
- **Protected**

### 4. Get by Event Name
- **GET** `/event-registrations/event/:eventName`
- **Protected**

### 5. Get by College
- **GET** `/event-registrations/college/:college`
- **Protected**

### 6. Get by Status
- **GET** `/event-registrations/status/:status`
- **Protected**

### 7. Create Event Registration
- **POST** `/event-registrations`
- **Protected**

### 8. Update Event Registration
- **PUT** `/event-registrations/:id`
- **Protected**

### 9. Delete Event Registration
- **DELETE** `/event-registrations/:id`
- **Protected**

---

## 📈 Reports Endpoints

### 1. Overall Statistics
- **GET** `/reports/statistics`
- **Protected**

### 2. Gender Report
- **GET** `/reports/gender-report`
- **Protected**

### 3. College Report
- **GET** `/reports/college-report`
- **Protected**

### 4. State Report
- **GET** `/reports/state-report`
- **Protected**

### 5. Event Report
- **GET** `/reports/event-report`
- **Protected**

### 6. Team Report
- **GET** `/reports/team-report`
- **Protected**

### 7. Get Registrations
- **GET** `/reports/registrations`
- **Protected**
- **Query Params**: page, limit, filters

### 8. Admin Metrics
- **GET** `/reports/admin-metrics`
- **Protected**

### 9. Teams Report
- **GET** `/reports/teams`
- **Protected**

### 10. Individuals Report
- **GET** `/reports/individuals`
- **Protected**

### 11. Colleges Summary
- **GET** `/reports/colleges-summary`
- **Protected**

### 12. Gender List
- **GET** `/reports/gender-list`
- **Protected**

### 13. Events Overview
- **GET** `/reports/events-overview`
- **Protected**

### 14. Amount Report
- **GET** `/reports/amount-report`
- **Protected**

### 15. Export Data
- **GET** `/reports/export-data`
- **Protected**

### 16. College Participants
- **GET** `/reports/college-participants`
- **Protected**

---

## 🔒 Authentication

Include JWT token in request headers:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

Token is obtained from login endpoint and stored in localStorage.

---

## ⚡ Response Format

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📊 Total Endpoints: 80+

- Authentication: 3
- Dashboard: 3
- Events: 5
- Colleges: 6
- Registrations: 6
- Participants: 7
- Teams: 7
- Coordinators: 11
- Leads: 7
- Event Registrations: 9
- Reports: 16

---

## 🎯 Environment Variables Required

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
NODE_ENV=development
```

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Create `.env` file in root
   - Add required variables

3. **Start Server**:
   ```bash
   node server/server.js
   ```

4. **API Base URL**:
   ```
   http://localhost:5000/api
   ```

---

## ✅ All Endpoints Tested and Production Ready!
