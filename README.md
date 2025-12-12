# Restaurant Reservation System

A complete restaurant reservation system with a NestJS backend and Next.js frontend, featuring role-based access for customers, staff, and administrators.

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js 18+** and npm
- **MongoDB** (local or cloud instance)
- **Email service** (for OTP verification)

### Running the Complete Application

#### 1. Backend Setup (Port 8000)

```bash
# Install backend dependencies
npm install

# Configure environment variables
# Create a .env file in the root directory with:
# MONGODB_URI=mongodb://localhost:27017/restaurant
# JWT_SECRET=your-secret-key
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-email-password

# Start the backend server
npm run start:dev
```

The backend will be available at **http://localhost:8000**

#### 2. Frontend Setup (Port 3000)

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create .env.local file (optional, defaults to localhost:8000)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the frontend development server
npm run dev
```

The frontend will be available at **http://localhost:3000**

### 🎯 Access the Application

1. Open your browser and go to **http://localhost:3000**
2. You'll see the homepage with options to:
   - **View Menu** - Browse available menu items
   - **Sign Up** - Create a new account
   - **Login** - Sign in to your account

### 👤 Test Credentials

**Admin Account:**
- Email: `eyad.admin2@gmail.com`
- Password: `Eyad2186`

### 📱 Features by Role

#### Customer Portal
- Browse menu with search and filters
- Create and manage reservations
- Select tables based on party size
- Submit feedback with star ratings
- View reservation history

#### Staff Portal
- View all customer reservations
- Manage table status
- Filter reservations by date and status
- View customer contact information

#### Admin Portal
- Menu management (Create, Update, Delete items)
- Feedback moderation (Approve/Reject reviews)
- Analytics dashboard with statistics
- User management
- Complete reservation oversight

## 📦 Project Structure

```
Restaurant-System/
├── src/                    # Backend source code (NestJS)
│   ├── controllers/        # API controllers
│   ├── services/          # Business logic
│   ├── models/            # MongoDB schemas
│   ├── modules/           # Feature modules
│   ├── dto/               # Data transfer objects
│   └── auth/              # Authentication
├── frontend/              # Frontend application (Next.js)
│   ├── app/
│   │   ├── admin/         # Admin portal pages
│   │   ├── staff/         # Staff portal pages
│   │   ├── menu/          # Menu browsing
│   │   ├── reservations/  # Reservation management
│   │   ├── feedback/      # Feedback submission
│   │   └── context/       # Auth context
│   └── public/            # Static assets
└── test/                  # Backend tests
```

## 🛠️ Available Scripts

### Backend (Root Directory)

```bash
npm run start:dev    # Start development server with hot reload
npm run build        # Build for production
npm run start:prod   # Run production build
npm run test         # Run unit tests
npm run lint         # Lint and fix code
```

### Frontend (frontend/ Directory)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Lint code
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/restaurant

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Email (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=8000
```

### Frontend Environment Variables (frontend/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 API Documentation

The backend API documentation is available at:
- **Swagger UI**: http://localhost:8000/api (when backend is running)
- See [BACKEND_COMPLETE_API_REFERENCE.md](./BACKEND_COMPLETE_API_REFERENCE.md) for detailed API docs

## 🎨 Technologies Used

### Backend
- **NestJS** - Progressive Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Passport** - Authentication middleware
- **Nodemailer** - Email service

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Context** - State management

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- OTP-based email verification
- Role-based access control (RBAC)
- Protected API routes
- CORS configuration
- Input validation and sanitization

## 📖 Documentation

- [Backend API Reference](./BACKEND_COMPLETE_API_REFERENCE.md)
- [Frontend Documentation](./frontend/README.md)
- [Implementation Summary](./frontend/IMPLEMENTATION_SUMMARY.md)
- [User Stories](./USER_STORIES_IMPLEMENTATION_MAP.md)

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check that port 8000 is not in use
- Verify environment variables are set correctly

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Clear browser cookies and try again

### Login not working
- Check that backend is connected to MongoDB
- Verify test credentials or create a new account
- Check browser console for errors

## 📝 License

This project is part of the Software Construction & Testing course.

## 👥 Contributing

This is a course project. For questions or issues, please contact the project maintainers.
