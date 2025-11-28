# HTTP Request Files - Quick Guide

## Files Created

1. **reservations.http** - Your original login request (fixed)
2. **api-requests.http** - Complete collection of all API endpoints

---

## ✅ Issue Fixed

**Error:** `java.lang.IllegalArgumentException: a header name can only contain "token" characters`

**Cause:** Missing `Content-Type: application/json` header in HTTP request

**Solution:** Added proper headers to all requests

---

## 🚀 How to Use (IntelliJ/WebStorm)

### Step 1: Open the HTTP File
Open `api-requests.http` in IntelliJ IDEA or WebStorm

### Step 2: Run Requests
Click the ▶️ green arrow next to any request to execute it

### Step 3: View Response
Response will appear in the "Run" panel at the bottom

---

## 📋 Testing Workflow

### 1. Authentication Flow
```
1. Register → POST /auth/register
2. Verify OTP → POST /auth/verify-otp (check console/email for OTP)
3. Login → POST /auth/login (saves cookie automatically)
4. Now you can use authenticated endpoints
```

### 2. Reservation Flow
```
1. Login first (to get cookie)
2. Create Reservation → POST /reservations
3. View Reservations → GET /reservations
4. Update if needed → PUT /reservations/{id}
5. Cancel if needed → PUT /reservations/{id}/cancel
```

### 3. Payment Flow
```
1. Login first
2. Create Reservation
3. Create Payment → POST /payments (use reservation ID)
4. View Payments → GET /payments/my-payments
5. [Admin] Complete Payment → PUT /payments/{id}/complete
```

---

## 🔧 Before Testing

### 1. Start the Server
```bash
cd D:\WebstormProjects\Software_Construction-Testing_Restaurant
npm run start
```

Server should start on `http://localhost:8000`

### 2. Ensure MongoDB is Running
Make sure MongoDB is running on `mongodb://localhost:27017/restaurant_db`

### 3. Set Up Environment Variables
Create `.env` file with:
```env
MONGODB_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=your-secret-key
PORT=8000
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

---

## 📝 Important Notes

### Cookies
- IntelliJ/WebStorm automatically handles cookies
- Login once, and subsequent requests use the saved cookie
- If you get 401 Unauthorized, login again

### Replace IDs
- Replace `674906d26cf2cc1c6cc95ed9` with actual IDs from responses
- After creating a reservation, copy its ID for payment creation
- Use the response IDs for update/delete operations

### Request Separators
- `###` separates requests in the file
- Each request can be run independently

### Response Panel
- Success responses: Green status code (200, 201, etc.)
- Error responses: Red status code (400, 401, 404, etc.)
- View full response body, headers, and cookies

---

## 🎯 Common Scenarios

### Scenario 1: New User Registration
```
1. POST /auth/register
2. Check console/database for OTP
3. POST /auth/verify-otp
4. POST /auth/login
```

### Scenario 2: Create Reservation with Payment
```
1. POST /auth/login
2. POST /reservations (copy the returned ID)
3. POST /payments (use reservation ID from step 2)
4. GET /payments/my-payments (verify payment created)
```

### Scenario 3: Admin Managing Payments
```
1. POST /auth/login (as admin)
2. GET /payments (view all payments)
3. GET /payments/statistics (view stats)
4. PUT /payments/{id}/complete (complete a payment)
```

---

## 🔐 Authentication Requirements

### Public Endpoints (No Login Required)
- POST /auth/register
- POST /auth/login
- POST /auth/verify-otp
- POST /auth/resend-otp
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/otp-status/:email

### Authenticated Endpoints (Login Required)
- All other endpoints require authentication
- Must have valid JWT token in cookie

### Admin Only Endpoints
- GET /users (all users)
- GET /users/:id
- PUT /users/:id/role
- DELETE /users/:id
- DELETE /payments/:id

### Admin/Staff Endpoints
- GET /payments (all payments)
- GET /payments/customer/:id
- GET /payments/status/:status
- GET /payments/statistics
- PUT /payments/:id/complete
- PUT /payments/:id/fail

---

## ⚠️ Common Errors

### 401 Unauthorized
**Solution:** Login first to get authentication cookie

### 409 Conflict
**Cause:** Duplicate reservation (same user, date, time)
**Solution:** Change date/time or use different account

### 400 Bad Request
**Cause:** Invalid data (check validation rules)
**Solution:** Verify request body matches requirements

### 404 Not Found
**Cause:** Resource doesn't exist
**Solution:** Verify the ID in the URL is correct

---

## 📚 Available Endpoints Summary

### Authentication (8 endpoints)
- Register, Login, Logout
- OTP verification, resend, status
- Password reset

### Reservations (9 endpoints)
- CRUD operations
- Date range filtering
- Availability checking
- User reservations

### Payments (13 endpoints)
- CRUD operations
- Status filtering
- Statistics
- Complete/Fail operations

### Users (8 endpoints)
- Profile management
- User listing (by role)
- Role management
- User CRUD (admin)

**Total: 38 API Endpoints**

---

## 🎨 Tips for IntelliJ/WebStorm

### Keyboard Shortcuts
- `Ctrl + Enter` - Run request at cursor
- `Ctrl + /` - Comment/uncomment line
- `Ctrl + D` - Duplicate line

### Environment Variables
You can create environment variables in IntelliJ:
```
Tools → HTTP Client → Create Environment File
```

### Response History
View previous responses:
```
Tools → HTTP Client → Show HTTP Requests History
```

---

## ✅ Your Fixed Login Request

**File:** `reservations.http`

```http
POST http://localhost:8000/auth/login
Content-Type: application/json

{
  "email": "yasmin.farag532007@gmail.com",
  "password": "Yasmin1234"
}
```

**Status:** ✅ Fixed and ready to use

---

## 📞 Need Help?

1. Check server is running: `http://localhost:8000/api` (Swagger docs)
2. Check server logs for errors
3. Verify MongoDB connection
4. Check request format matches documentation

---

**Created:** November 28, 2024
**Status:** ✅ Ready for Testing
**Files:** 2 HTTP request files with 38+ endpoints

