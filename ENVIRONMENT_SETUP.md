# Environment Setup Guide

This guide will help you create and configure the environment files needed to run the Restaurant Reservation System.

## Backend Environment Setup

### 1. Create the Backend `.env` File

In the **root directory** of the project, create a file named `.env`:

```bash
# From the project root directory
touch .env
```

### 2. Configure Backend Environment Variables

Copy the following content into your `.env` file and update the values:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration (optional)
FRONTEND_URL=http://localhost:3000
```

### Backend Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/restaurant` |
| `JWT_SECRET` | Secret key for JWT token generation (use a strong random string) | `my-super-secret-key-12345` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` (7 days) |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | Email address for sending OTP | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password or app-specific password | `your-app-password` |
| `PORT` | Backend server port | `8000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Setting Up Gmail for Email (Optional)

If you want to use Gmail for OTP emails:

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password
   - Use this password in `EMAIL_PASS`

**Note:** Without email configuration, OTP verification won't work, but you can still test other features.

---

## Frontend Environment Setup

### 1. Create the Frontend `.env.local` File

In the **frontend directory**, create a file named `.env.local`:

```bash
# From the project root directory
cd frontend
touch .env.local
```

### 2. Configure Frontend Environment Variables

Copy the following content into your `frontend/.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Frontend Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

**Note:** The `NEXT_PUBLIC_` prefix makes this variable accessible in the browser.

---

## Quick Setup Commands

### Option 1: Copy from Examples

```bash
# Backend
cp .env.example .env
# Then edit .env with your actual values

# Frontend
cd frontend
cp .env.local.example .env.local
# Then edit .env.local if needed (default works for local development)
```

### Option 2: Create Manually

**Backend (.env in root directory):**
```bash
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/restaurant
JWT_SECRET=my-secret-key-please-change-in-production
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
```

**Frontend (.env.local in frontend directory):**
```bash
cd frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

---

## Verification

### Check Backend Configuration

```bash
# Make sure .env exists in root directory
ls -la .env

# Start the backend (it will show errors if env vars are missing)
npm run start:dev
```

### Check Frontend Configuration

```bash
# Make sure .env.local exists in frontend directory
ls -la frontend/.env.local

# Start the frontend
cd frontend
npm run dev
```

---

## Troubleshooting

### Backend won't start

- **Error: "Cannot connect to MongoDB"**
  - Ensure MongoDB is running: `mongod` or check your MongoDB service
  - Verify `MONGODB_URI` in `.env`

- **Error: "JWT_SECRET is not defined"**
  - Check that `.env` file exists in the root directory
  - Verify all required variables are set

### Frontend can't connect to backend

- **Error: "Network Error" or "ERR_CONNECTION_REFUSED"**
  - Ensure backend is running on port 8000
  - Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
  - Verify there are no firewall issues

### Email/OTP not working

- Check `EMAIL_*` variables are correctly set
- For Gmail, ensure you're using an App Password, not your regular password
- Test email configuration separately before debugging the app

---

## Security Notes

⚠️ **Important:**

1. **Never commit `.env` or `.env.local` files to version control**
   - These files contain sensitive information
   - They are already in `.gitignore`

2. **Use strong, unique values for production:**
   - Generate a secure `JWT_SECRET`: `openssl rand -base64 32`
   - Use environment-specific values for different deployments

3. **Keep your email credentials secure:**
   - Use App Passwords instead of account passwords
   - Consider using a dedicated email account for the application

---

## Default Configuration (for testing without setup)

If you don't create environment files, the application will use these defaults:

**Backend:**
- MongoDB: `mongodb://localhost:27017/restaurant`
- Port: `8000`
- JWT expiration: `7d`

**Frontend:**
- API URL: `http://localhost:8000`

**Note:** Email functionality will not work without proper email configuration.

---

## Next Steps

After setting up your environment files:

1. Install dependencies
2. Start MongoDB (if using local instance)
3. Start the backend server
4. Start the frontend development server
5. Visit http://localhost:3000

See [README.md](./README.md) for detailed running instructions.
