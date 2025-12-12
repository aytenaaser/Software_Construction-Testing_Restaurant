# Restaurant Reservation System - Frontend

A modern, responsive Next.js frontend for the Restaurant Reservation System.

## Features

### Customer Portal
- **Homepage**: Welcome page with restaurant information and features
- **Menu Browsing**: Browse and search menu items by category
- **Reservations**: 
  - Create new reservations with table selection
  - View and manage your reservations
  - Cancel or modify existing reservations
- **Feedback**: Submit detailed feedback after dining

### Staff Portal
- View all reservations
- Manage table status
- View kitchen orders

### Admin Portal
- **Menu Management**: Full CRUD operations for menu items
- **User Management**: Manage users and roles
- **Reservations**: View and manage all reservations
- **Feedback Moderation**: Review and respond to customer feedback
- **Analytics**: View reports and statistics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Authentication**: JWT with HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── admin/              # Admin pages
│   │   ├── menu/           # Menu management
│   │   ├── users/          # User management
│   │   ├── reservations/   # Reservation management
│   │   ├── feedback/       # Feedback moderation
│   │   └── analytics/      # Analytics dashboard
│   ├── staff/              # Staff pages
│   │   ├── reservations/   # View reservations
│   │   ├── tables/         # Manage tables
│   │   └── orders/         # Kitchen orders
│   ├── context/            # React Context (Auth)
│   ├── utils/              # Utilities (API client)
│   ├── menu/               # Menu browsing
│   ├── reservations/       # Customer reservations
│   ├── feedback/           # Feedback submission
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── dashboard/          # User dashboard
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.js
```

## Key Features

### Authentication
- JWT-based authentication with HTTP-only cookies
- Protected routes for authenticated users
- Role-based access control (Customer, Staff, Admin)

### Responsive Design
- Mobile-first approach
- Works seamlessly on desktop, tablet, and mobile devices

### User Experience
- Real-time form validation
- Loading states and error handling
- Intuitive navigation
- Success/error notifications

## API Integration

The frontend communicates with the backend API running on port 8000. All API calls are made through the axios instance configured in `app/utils/ApiClient.ts`.

### Key Endpoints Used
- `/auth/*` - Authentication endpoints
- `/menu` - Menu management
- `/reservations` - Reservation management
- `/feedback` - Feedback submission
- `/tables` - Table management

## Pages Overview

### Public Pages
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/menu` - Browse menu (accessible to all)

### Protected Pages (Customer)
- `/dashboard` - User dashboard
- `/reservations` - View reservations
- `/reservations/new` - Create reservation
- `/feedback` - Submit feedback

### Staff Pages
- `/staff` - Staff dashboard
- `/staff/reservations` - View all reservations
- `/staff/tables` - Manage tables
- `/staff/orders` - Kitchen orders

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/menu` - Menu management
- `/admin/users` - User management
- `/admin/reservations` - All reservations
- `/admin/feedback` - Feedback moderation
- `/admin/analytics` - Analytics

## Development

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for consistent formatting

### Components
The project uses functional components with React Hooks for state management.

## License

This project is part of the Software Construction & Testing course.
