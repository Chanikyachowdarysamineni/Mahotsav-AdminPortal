# Admin Portal - Login Credentials

## 🔐 Available Users

All users have been pushed to MongoDB Atlas database: **test**

### Admin Users

1. **Admin User**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: admin

2. **Super Admin**
   - Email: `superadmin@example.com`
   - Password: `super123`
   - Role: admin

3. **Test Admin**
   - Email: `test@example.com`
   - Password: `test123`
   - Role: admin

### Regular Users

4. **John Doe**
   - Email: `john@example.com`
   - Password: `john123`
   - Role: user

5. **Jane Smith**
   - Email: `jane@example.com`
   - Password: `jane123`
   - Role: user

---

## 📝 Files Created

- `server/users.json` - JSON file with all user data
- `server/pushUsers.js` - Script to push users to MongoDB
- `CREDENTIALS.md` - This file

## 🚀 Commands

### Push users to MongoDB
```bash
npm run push-users
```

### Start the application
```bash
npm run dev
```

### Access the application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📊 Database Info

- **Connection**: MongoDB Atlas
- **Database Name**: test
- **Collection**: users
- **Total Users**: 5 (3 admins, 2 users)

## ⚠️ Note

The passwords in `users.json` are plain text for reference only. They are automatically hashed using bcrypt before being stored in MongoDB.
