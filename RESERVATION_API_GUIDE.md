# Reservation Service - Integration & API Guide

## 🚀 Quick Start

### 1. Start the Application
```bash
cd 'D:\Fifth Semester\Testing\Project\TestingProject\Software_Construction-Testing_Restaurant\testing'
npm run start:dev
```

Server runs on: `http://localhost:3000`

### 2. Get JWT Token
First, register and login to get a JWT token:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Use the `access_token` from response in Authorization header.

---

## 📡 API Endpoints

### 1. Create Reservation
```http
POST /reservations
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "reservationDate": "2024-12-25",
  "reservationTime": "19:00",
  "partySize": 4,
  "tableId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012"
}
```

**Response** (201 Created):
```json
{
  "id": "507f1f77bcf86cd799439013",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "reservationDate": "2024-12-25T00:00:00.000Z",
  "reservationTime": "19:00",
  "partySize": 4,
  "tableId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "status": "confirmed",
  "createdAt": "2024-11-27T10:30:00.000Z",
  "updatedAt": "2024-11-27T10:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or validation failed
  ```json
  {
    "message": "Reservation validation failed",
    "errors": ["Reservation time must be between 10:00 and 22:00"],
    "statusCode": 400
  }
  ```
- `409 Conflict`: Duplicate reservation
  ```json
  {
    "message": "A reservation already exists for this date, time, and table",
    "statusCode": 409
  }
  ```

---

### 2. Get All Reservations
```http
GET /reservations
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "reservationDate": "2024-12-25T00:00:00.000Z",
    "reservationTime": "19:00",
    "partySize": 4,
    "tableId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "status": "confirmed",
    "createdAt": "2024-11-27T10:30:00.000Z",
    "updatedAt": "2024-11-27T10:30:00.000Z"
  }
]
```

---

### 3. Find by Date Range
```http
GET /reservations/range?startDate=2024-12-01&endDate=2024-12-31
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters**:
- `startDate`: ISO 8601 date (YYYY-MM-DD)
- `endDate`: ISO 8601 date (YYYY-MM-DD)

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "customerName": "John Doe",
    ...
  }
]
```

---

### 4. Find by User
```http
GET /reservations/user/507f1f77bcf86cd799439012
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "customerName": "John Doe",
    ...
  }
]
```

---

### 5. Check Availability
```http
GET /reservations/availability/check?date=2024-12-25&time=19:00&partySize=4
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters**:
- `date`: ISO 8601 date (YYYY-MM-DD)
- `time`: Time in HH:mm format
- `partySize`: Number between 1-20

**Response** (200 OK):
```json
{
  "date": "2024-12-25T00:00:00.000Z",
  "time": "19:00",
  "partySize": 4,
  "bookedTables": 2,
  "availableTablesInfo": "Contact restaurant for table availability"
}
```

---

### 6. Get Single Reservation
```http
GET /reservations/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439013",
  "customerName": "John Doe",
  ...
}
```

**Error Response** (404 Not Found):
```json
{
  "message": "Reservation with ID 507f1f77bcf86cd799439099 not found",
  "statusCode": 404
}
```

---

### 7. Update Reservation
```http
PUT /reservations/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "partySize": 5,
  "reservationTime": "20:00"
}
```

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439013",
  "customerName": "John Doe",
  "partySize": 5,
  "reservationTime": "20:00",
  ...
}
```

---

### 8. Cancel Reservation
```http
PUT /reservations/507f1f77bcf86cd799439013/cancel
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439013",
  "status": "cancelled",
  ...
}
```

**Error Response** (409 Conflict):
```json
{
  "message": "Reservation is already cancelled",
  "statusCode": 409
}
```

---

### 9. Delete Reservation
```http
DELETE /reservations/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (204 No Content)

---

## 📝 Validation Rules

### Business Hours
- **Valid Times**: 10:00 - 22:00
- **Example Valid**: "10:00", "14:30", "21:59"
- **Example Invalid**: "09:00", "23:00"

### Booking Advance
- **Minimum**: 2 hours in advance
- **Example**: If current time is 14:00, earliest reservation is 16:00

### Party Size
- **Range**: 1 - 20 people
- **Example Valid**: 1, 2, 5, 10, 20
- **Example Invalid**: 0, 21, -1

### Dates
- **Format**: ISO 8601 (YYYY-MM-DD)
- **Example Valid**: "2024-12-25", "2025-01-15"
- **Example Invalid**: "12/25/2024", "2024-13-01"

### Time Format
- **Format**: HH:mm (24-hour)
- **Example Valid**: "10:00", "14:30", "23:59"
- **Example Invalid**: "2:30 PM", "10h30"

### Email
- **Format**: Valid email address
- **Example Valid**: "john@example.com"
- **Example Invalid**: "john.example.com", "@example.com"

---

## 🔐 Error Codes

| Code | Meaning | Example Scenario |
|------|---------|-------------------|
| 400 | Bad Request | Invalid time format or outside business hours |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Reservation ID doesn't exist |
| 409 | Conflict | Duplicate reservation or already cancelled |
| 500 | Server Error | Database connection error |

---

## 🧪 Testing Examples

### Using Postman

1. **Import Collection**:
   ```json
   {
     "info": {
       "name": "Reservation Service",
       "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
     },
     "item": [
       {
         "name": "Create Reservation",
         "request": {
           "method": "POST",
           "url": "http://localhost:3000/reservations",
           "header": [
             { "key": "Authorization", "value": "Bearer {{token}}" },
             { "key": "Content-Type", "value": "application/json" }
           ],
           "body": {
             "mode": "raw",
             "raw": "{ \"customerName\": \"John Doe\", ... }"
           }
         }
       }
     ]
   }
   ```

2. **Environment Variables**:
   - `base_url`: http://localhost:3000
   - `token`: Your JWT token

### Using cURL

```bash
# Create reservation
curl -X POST http://localhost:3000/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "reservationDate": "2024-12-25",
    "reservationTime": "19:00",
    "partySize": 4,
    "tableId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012"
  }'

# Get all reservations
curl -X GET http://localhost:3000/reservations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Find by date range
curl -X GET "http://localhost:3000/reservations/range?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get single reservation
curl -X GET http://localhost:3000/reservations/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update reservation
curl -X PUT http://localhost:3000/reservations/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "partySize": 5 }'

# Cancel reservation
curl -X PUT http://localhost:3000/reservations/507f1f77bcf86cd799439013/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete reservation
curl -X DELETE http://localhost:3000/reservations/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Debugging

### Enable Detailed Logging
```bash
# In your code, add before service call:
console.log('Request:', createReservationDto);

// In service method:
console.error('Validation error:', validationResult.errors);
console.log('Created reservation:', savedReservation);
```

### Common Issues

**Issue**: `Cannot find module 'mongoose'`
```bash
npm install mongoose
```

**Issue**: JWT token invalid
- Verify token is not expired
- Include `Bearer` prefix
- Check Authorization header spelling

**Issue**: Reservation creation fails with 409
- Check if reservation already exists for same date/time/table
- Try different date/time/table combination

**Issue**: Date validation fails
- Ensure date is 2+ hours in future
- Ensure time is within 10:00 - 22:00
- Format date as ISO 8601 (YYYY-MM-DD)

---

## 📊 Performance Tips

### Database Queries
- Use date range filter to limit results
- Indexes are automatically created for:
  - `userId` + `reservationDate`
  - `reservationDate` + `reservationTime` + `tableId`
  - `status` + `reservationDate`

### Response Times
- Typical: 50-100ms
- With email verification: 1-2s
- Database indexes improve query performance

---

## 🚀 Deployment

### Environment Variables
Create `.env` file:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
```

### Production Build
```bash
npm run build
npm run start:prod
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT Authentication](https://jwt.io)
- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes)

---

## 💡 Support

For issues or questions:
1. Check error message and validation rules
2. Review logs in console
3. Verify JWT token is valid
4. Check MongoDB connection
5. Ensure all required fields are provided

---

**Last Updated**: November 27, 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team

