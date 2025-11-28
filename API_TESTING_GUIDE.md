# API Testing Guide - Request Bodies

This document contains all API endpoints with example request bodies for testing the Restaurant Reservation System backend.

---

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Reservation Endpoints](#reservation-endpoints)
4. [Payment Endpoints](#payment-endpoints)
5. [Environment Setup](#environment-setup)

---

## 🔐 Authentication Endpoints

Base URL: `http://localhost:8000/auth`

### 1. Register User

**POST** `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123",
  "phone": "+1234567890",
  "role": "customer"
}
```

**Response:**
```json
{
  "message": "Registered. Verify email via OTP.",
  "newUser": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "_id": "507f1f77bcf86cd799439011"
  }
}
```

---

### 2. Verify OTP

**POST** `/auth/verify-otp`

```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "role": "customer"
  }
}
```

---

### 3. Resend OTP

**POST** `/auth/resend-otp`

```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully"
}
```

---

### 4. Check OTP Status

**GET** `/auth/otp-status/:email`

Example: `GET /auth/otp-status/john.doe@example.com`

**Response:**
```json
{
  "valid": true,
  "expiresAt": "2024-12-15T10:10:00.000Z"
}
```

---

### 5. Login

**POST** `/auth/login`

```json
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "role": "customer",
    "isEmailVerified": true
  }
}
```

**Note:** JWT token is set in HTTP-only cookie named `access_token`

---

### 6. Logout

**POST** `/auth/logout`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

### 7. Forgot Password

**POST** `/auth/forgot-password`

```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent to email"
}
```

---

### 8. Reset Password

**POST** `/auth/reset-password`

```json
{
  "email": "john.doe@example.com",
  "otpCode": "123456",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

---

## 👤 User Endpoints

Base URL: `http://localhost:8000/users`

**Authentication Required:** All endpoints require JWT token in cookie

### 1. Get Current User Profile

**GET** `/users/profile`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "customer",
  "phone": "+1234567890",
  "createdAt": "2024-12-15T10:00:00.000Z"
}
```

---

### 2. Update Current User Profile

**PUT** `/users/profile`

**Headers:**
```
Cookie: access_token={jwt_token}
```

```json
{
  "name": "John Updated Doe",
  "phone": "+1987654321"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Updated Doe",
  "email": "john.doe@example.com",
  "role": "customer",
  "phone": "+1987654321"
}
```

---

### 3. Get All Users (Admin Only)

**GET** `/users`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN

**Body:** None

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "createdAt": "2024-12-15T10:00:00.000Z"
  }
]
```

---

### 4. Get Staff Members (Admin Only)

**GET** `/users/staff`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN

**Body:** None

---

### 5. Get Customers (Admin/Staff Only)

**GET** `/users/customers`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Body:** None

---

### 6. Get User by ID (Admin Only)

**GET** `/users/:id`

Example: `GET /users/507f1f77bcf86cd799439011`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN

**Body:** None

---

### 7. Update User Role (Admin Only)

**PUT** `/users/:id/role`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN

```json
{
  "role": "staff"
}
```

**Allowed Roles:** customer, staff, admin

---

### 8. Delete User (Admin Only)

**DELETE** `/users/:id`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN

**Body:** None

---

## 📅 Reservation Endpoints

Base URL: `http://localhost:8000/reservations`

**Authentication Required:** All endpoints require JWT token

### 1. Create Reservation

**POST** `/reservations`

**Headers:**
```
Cookie: access_token={jwt_token}
```

```json
{
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "reservationDate": "2024-12-20",
  "reservationTime": "19:00",
  "partySize": 4
}
```

**Business Rules:**
- `reservationTime`: Any time format accepted
- `partySize`: Must be between 1 and 20
- `reservationDate`: Any date format accepted

**Response:**
```json
{
  "id": "507f191e810c19729de860ea",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "reservationDate": "2024-12-20T00:00:00.000Z",
  "reservationTime": "19:00",
  "partySize": 4,
  "tableId": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "status": "confirmed",
  "createdAt": "2024-12-15T10:00:00.000Z",
  "updatedAt": "2024-12-15T10:00:00.000Z"
}
```

---

### 2. Get All Reservations

**GET** `/reservations`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

**Response:**
```json
[
  {
    "id": "507f191e810c19729de860ea",
    "customerName": "John Doe",
    "customerEmail": "john.doe@example.com",
    "reservationDate": "2024-12-20T00:00:00.000Z",
    "reservationTime": "19:00",
    "partySize": 4,
    "status": "confirmed"
  }
]
```

---

### 3. Get Reservation by ID

**GET** `/reservations/:id`

Example: `GET /reservations/507f191e810c19729de860ea`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

---

### 4. Get Reservations by Date Range

**GET** `/reservations/range?startDate={date}&endDate={date}`

Example: `GET /reservations/range?startDate=2024-12-01&endDate=2024-12-31`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Query Parameters:**
- `startDate`: ISO date format (YYYY-MM-DD)
- `endDate`: ISO date format (YYYY-MM-DD)

**Body:** None

---

### 5. Get User's Reservations

**GET** `/reservations/user/:userId`

Example: `GET /reservations/user/507f1f77bcf86cd799439011`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

---

### 6. Check Availability

**GET** `/reservations/availability/check?date={date}&time={time}&partySize={number}`

Example: `GET /reservations/availability/check?date=2024-12-20&time=19:00&partySize=4`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Query Parameters:**
- `date`: ISO date format (YYYY-MM-DD)
- `time`: Time format (HH:mm)
- `partySize`: Number between 1 and 20

**Body:** None

**Response:**
```json
{
  "date": "2024-12-20T00:00:00.000Z",
  "time": "19:00",
  "partySize": 4,
  "bookedTables": 2,
  "availableTablesInfo": "Contact restaurant for table availability"
}
```

---

### 7. Update Reservation

**PUT** `/reservations/:id`

**Headers:**
```
Cookie: access_token={jwt_token}
```

```json
{
  "reservationDate": "2024-12-21",
  "reservationTime": "20:00",
  "partySize": 6
}
```

**Optional Fields:**
- customerName
- customerEmail
- reservationDate
- reservationTime
- partySize
- status

---

### 8. Cancel Reservation

**PUT** `/reservations/:id/cancel`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

**Response:**
```json
{
  "id": "507f191e810c19729de860ea",
  "status": "cancelled"
}
```

---

### 9. Delete Reservation

**DELETE** `/reservations/:id`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

**Response:** 204 No Content

---

## 💳 Payment Endpoints

Base URL: `http://localhost:8000/payments`

**Authentication Required:** All endpoints require JWT token

### 1. Create Payment

**POST** `/payments`

**Headers:**
```
Cookie: access_token={jwt_token}
```

```json
{
  "reservationId": "507f191e810c19729de860ea",
  "amount": 200.00,
  "method": "credit_card"
}
```

**Payment Methods:**
- `credit_card`
- `debit_card`
- `cash`

**Business Rules:**
- Amount must be ≥ 0
- Amount cannot exceed $100,000
- Only one pending payment per reservation
- Suggested: 20% deposit = partySize × $50 × 0.2

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "reservationId": "507f191e810c19729de860ea",
  "customerId": "507f1f77bcf86cd799439011",
  "amount": 200,
  "method": "credit_card",
  "status": "pending",
  "createdAt": "2024-12-15T10:00:00.000Z"
}
```

---

### 2. Get All Payments (Admin/Staff Only)

**GET** `/payments`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Body:** None

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439014",
    "reservationId": "507f191e810c19729de860ea",
    "customerId": "507f1f77bcf86cd799439011",
    "amount": 200,
    "method": "credit_card",
    "status": "pending",
    "createdAt": "2024-12-15T10:00:00.000Z"
  }
]
```

---

### 3. Get Payment by ID

**GET** `/payments/:id`

Example: `GET /payments/507f1f77bcf86cd799439014`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

---

### 4. Get My Payments

**GET** `/payments/my-payments`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

**Response:** Array of current user's payments

---

### 5. Get Payments by Reservation

**GET** `/payments/reservation/:reservationId`

Example: `GET /payments/reservation/507f191e810c19729de860ea`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Body:** None

---

### 6. Get Payments by Customer (Admin/Staff Only)

**GET** `/payments/customer/:customerId`

Example: `GET /payments/customer/507f1f77bcf86cd799439011`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Body:** None

---

### 7. Get Payments by Status (Admin/Staff Only)

**GET** `/payments/status/:status`

Example: `GET /payments/status/pending`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Status Values:**
- `pending`
- `completed`
- `failed`

**Body:** None

---

### 8. Get Payments by Date Range (Admin/Staff Only)

**GET** `/payments/range?startDate={date}&endDate={date}`

Example: `GET /payments/range?startDate=2024-12-01&endDate=2024-12-31`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Query Parameters:**
- `startDate`: ISO date format (YYYY-MM-DD)
- `endDate`: ISO date format (YYYY-MM-DD)

**Body:** None

---

### 9. Get Payment Statistics (Admin/Staff Only)

**GET** `/payments/statistics`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Body:** None

**Response:**
```json
{
  "totalPayments": 150,
  "totalAmount": 45000.00,
  "completedPayments": 120,
  "completedAmount": 38000.00,
  "pendingPayments": 20,
  "pendingAmount": 5000.00,
  "failedPayments": 10
}
```

---

### 10. Complete Payment (Admin/Staff Only)

**PUT** `/payments/:id/complete`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Body:** None

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "status": "completed",
  "completedAt": "2024-12-15T10:05:00.000Z"
}
```

---

### 11. Mark Payment as Failed (Admin/Staff Only)

**PUT** `/payments/:id/fail`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

**Body:** None

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "status": "failed"
}
```

---

### 12. Update Payment (Admin/Staff Only)

**PUT** `/payments/:id`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN or STAFF

```json
{
  "status": "completed",
  "amount": 250.00
}
```

**Optional Fields:**
- status (pending, completed, failed)
- amount

---

### 13. Delete Payment (Admin Only)

**DELETE** `/payments/:id`

**Headers:**
```
Cookie: access_token={jwt_token}
```

**Required Role:** ADMIN

**Body:** None

**Response:** 204 No Content

**Note:** Only pending or failed payments can be deleted

---


**Document Version:** 1.0  
**Last Updated:** November 28, 2024  
**API Version:** v1  
**Base URL:** `http://localhost:8000`

