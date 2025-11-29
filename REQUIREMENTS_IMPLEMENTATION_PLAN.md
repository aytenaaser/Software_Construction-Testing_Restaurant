# Requirements Implementation Plan

## Overview
This document maps all functional and non-functional requirements to implementation status and identifies gaps.

---

## ✅ **Already Implemented**

### Customer-Facing Features
| Requirement | Status | Implementation |
|------------|--------|----------------|
| Create reservations | ✅ Done | `POST /reservations` |
| View reservations | ✅ Done | `GET /reservations/my-reservations` |
| Modify reservations | ✅ Done | `PUT /reservations/:id` |
| Cancel reservations | ✅ Done | `PUT /reservations/:id/cancel` |
| Secure authentication | ✅ Done | JWT + cookies |

### Staff and Administrative Features
| Requirement | Status | Implementation |
|------------|--------|----------------|
| View all reservations | ✅ Done | `GET /reservations` (admin) |
| Manage reservations | ✅ Done | Approve/reject endpoints |
| Table management | ✅ Done | Full CRUD for tables |
| User account management | ✅ Done | User CRUD + roles |
| Manage table availability | ✅ Done | Check availability endpoint |

---

## 🔴 **Missing Features to Implement**

### High Priority (Core Functionality)

#### 1. **Real-time 2D Restaurant Layout** 🎯
- **User Stories:**
  - "As a customer, I want to view table availability in real time"
  - "As a staff member, I want to update table status"
  
- **Implementation Plan:**
  - Create `RestaurantLayout` schema with floor plan data
  - Add table positions (x, y coordinates)
  - Frontend: Interactive SVG/Canvas layout
  - Real-time updates via WebSocket or polling
  - Color-coded table status (available, reserved, occupied)

#### 2. **Pre-order Menu Items** 🍽️
- **User Story:** "As a customer, I want to pre-order my meal"
  
- **Implementation Plan:**
  - Create `MenuItem` schema
  - Create `MenuOrder` schema (linked to reservations)
  - Add menu management endpoints (admin)
  - Add pre-order endpoint for customers
  - Update reservation schema to include menuOrders array

#### 3. **Customer Feedback & Ratings** ⭐
- **User Story:** "As a customer, I want to leave feedback and ratings"
  
- **Implementation Plan:**
  - Create `Feedback` schema
  - Add rating (1-5 stars)
  - Add review text
  - Add feedback submission endpoint
  - Admin dashboard to view feedback
  - Link feedback to completed reservations

#### 4. **Email/SMS Notifications** 📧
- **User Stories:** 
  - "As a customer, I want to receive booking confirmations"
  - "As a customer, I want to receive reminders"
  
- **Implementation Plan:**
  - Email service already exists (for OTP)
  - Extend email service for:
    - Reservation confirmation
    - Reservation reminder (24 hours before)
    - Cancellation notification
    - Status update notifications
  - Add SMS service (Twilio integration)
  - Create notification templates

#### 5. **Payment Integration** 💳
- **User Story:** "As a customer, I want to pay a deposit online"
  
- **Current Status:** Payment schema exists but needs integration
- **Implementation Plan:**
  - Integrate Stripe/PayPal
  - Add deposit amount configuration
  - Payment confirmation flow
  - Refund handling for cancellations
  - Payment history

#### 6. **Analytics & Reports** 📊
- **User Story:** "As an administrator, I want to generate reports"
  
- **Implementation Plan:**
  - Create analytics service
  - Reports:
    - Reservation trends (daily, weekly, monthly)
    - Popular time slots
    - Table utilization
    - Revenue reports
    - Customer feedback summary
    - Cancellation rates
  - Export to CSV/PDF

#### 7. **Reservation Policies Configuration** ⚙️
- **User Story:** "As an administrator, I want to configure reservation policies"
  
- **Implementation Plan:**
  - Create `ReservationPolicy` schema
  - Configurable settings:
    - Advance booking window (e.g., 1-30 days)
    - Cancellation policy (hours before)
    - Deposit amount/percentage
    - Max party size
    - Reservation duration
    - Operating hours
    - Blackout dates
  - Admin UI to manage policies

---

## 📋 **Implementation Priority**

### Phase 1: Essential Features (Week 1)
1. ✅ Menu Management System
2. ✅ Pre-order Functionality
3. ✅ Email Notifications (extend existing)
4. ✅ Feedback & Ratings System

### Phase 2: Enhanced UX (Week 2)
5. ✅ 2D Restaurant Layout
6. ✅ Real-time Table Status Updates
7. ✅ Reservation Policies Configuration

### Phase 3: Business Features (Week 3)
8. ✅ Payment Integration (Stripe)
9. ✅ Analytics & Reports
10. ✅ SMS Notifications

---

## 🎯 **Implementation Details**

### 1. Menu Management System

#### Schema: `MenuItem`
```typescript
{
  name: string;
  description: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  price: number;
  image: string;
  available: boolean;
  preparationTime: number; // minutes
  allergens: string[];
  tags: string[];
}
```

#### Endpoints:
- `POST /menu` - Create menu item (admin)
- `GET /menu` - Get all menu items
- `GET /menu/:id` - Get menu item
- `PUT /menu/:id` - Update menu item (admin)
- `DELETE /menu/:id` - Delete menu item (admin)
- `GET /menu/categories/:category` - Get by category

### 2. Pre-order System

#### Schema: `MenuOrder`
```typescript
{
  reservationId: ObjectId;
  items: [{
    menuItemId: ObjectId;
    quantity: number;
    specialInstructions: string;
  }];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready';
}
```

#### Update Reservation Schema:
```typescript
@Prop({ type: MongooseSchema.Types.ObjectId, ref: 'MenuOrder' })
menuOrderId?: MongooseSchema.Types.ObjectId;

@Prop()
hasPreOrder: boolean;
```

#### Endpoints:
- `POST /reservations/:id/pre-order` - Add pre-order
- `GET /reservations/:id/pre-order` - Get pre-order
- `PUT /reservations/:id/pre-order` - Update pre-order
- `DELETE /reservations/:id/pre-order` - Cancel pre-order

### 3. Feedback System

#### Schema: `Feedback`
```typescript
{
  reservationId: ObjectId;
  userId: ObjectId;
  rating: number; // 1-5
  foodQuality: number; // 1-5
  serviceQuality: number; // 1-5
  ambience: number; // 1-5
  valueForMoney: number; // 1-5
  review: string;
  wouldRecommend: boolean;
  images: string[];
  response: string; // Admin response
  status: 'pending' | 'approved' | 'rejected';
}
```

#### Endpoints:
- `POST /feedback` - Submit feedback
- `GET /feedback` - Get all feedback (admin)
- `GET /feedback/my-feedback` - Get user's feedback
- `GET /feedback/reservation/:id` - Get feedback for reservation
- `PUT /feedback/:id/respond` - Admin respond to feedback
- `GET /feedback/stats` - Get feedback statistics

### 4. Enhanced Notification System

#### Schema: `Notification`
```typescript
{
  userId: ObjectId;
  type: 'reservation_confirmed' | 'reservation_reminder' | 'reservation_cancelled' | 'status_update';
  channel: 'email' | 'sms' | 'both';
  subject: string;
  message: string;
  sent: boolean;
  sentAt: Date;
  error: string;
}
```

#### Email Templates:
1. Reservation Confirmation
2. Reservation Reminder (24h before)
3. Cancellation Confirmation
4. Status Update (pending → confirmed)
5. Payment Receipt

#### SMS Templates:
1. Quick confirmation with booking details
2. Reminder text
3. Cancellation confirmation

### 5. Restaurant Layout System

#### Schema: `RestaurantLayout`
```typescript
{
  name: string; // Floor name (Ground, First, Outdoor)
  width: number;
  height: number;
  tables: [{
    tableId: ObjectId;
    x: number;
    y: number;
    shape: 'circle' | 'square' | 'rectangle';
    rotation: number;
  }];
  walls: [{x1, y1, x2, y2}];
  decorations: [{type, x, y}];
}
```

#### Update Table Schema:
```typescript
@Prop()
floor: string;

@Prop()
position: { x: number; y: number };

@Prop()
shape: string;

@Prop({ default: 'available' })
status: 'available' | 'reserved' | 'occupied' | 'unavailable';
```

#### Endpoints:
- `GET /restaurant/layout` - Get restaurant layout
- `PUT /restaurant/layout` - Update layout (admin)
- `GET /restaurant/tables/status` - Real-time table status
- `PUT /tables/:id/status` - Update table status (staff)

### 6. Reservation Policies

#### Schema: `ReservationPolicy`
```typescript
{
  advanceBookingDays: { min: number; max: number };
  cancellationHours: number;
  depositPercentage: number;
  maxPartySize: number;
  defaultReservationDuration: number; // minutes
  operatingHours: {
    [day: string]: { open: string; close: string };
  };
  blackoutDates: Date[];
  requiresDeposit: boolean;
  autoConfirm: boolean;
}
```

#### Endpoints:
- `GET /policies` - Get current policies
- `PUT /policies` - Update policies (admin)

### 7. Payment Integration

#### Extend Payment Schema:
```typescript
@Prop()
stripePaymentIntentId: string;

@Prop()
refundId: string;

@Prop()
refundAmount: number;

@Prop()
refundReason: string;
```

#### Endpoints:
- `POST /payments/create-payment-intent` - Create Stripe payment
- `POST /payments/:id/confirm` - Confirm payment
- `POST /payments/:id/refund` - Process refund (admin)
- `GET /payments/history` - Payment history

### 8. Analytics & Reports

#### Analytics Service Methods:
```typescript
- getReservationTrends(startDate, endDate)
- getPopularTimeSlots()
- getTableUtilization()
- getRevenueReport(startDate, endDate)
- getCustomerInsights()
- getCancellationAnalytics()
- getFeedbackSummary()
```

#### Endpoints:
- `GET /analytics/reservations` - Reservation analytics
- `GET /analytics/revenue` - Revenue reports
- `GET /analytics/feedback` - Feedback analytics
- `GET /analytics/tables` - Table utilization
- `GET /analytics/customers` - Customer insights
- `GET /analytics/export` - Export reports (CSV/PDF)

---

## 🎨 **Frontend Components to Create**

### Customer Portal
1. ✅ Restaurant Layout Viewer (interactive map)
2. ✅ Menu Browser (categorized)
3. ✅ Pre-order Cart
4. ✅ Feedback Form
5. ✅ Payment Form (Stripe Elements)
6. ✅ Reservation History with Status
7. ✅ Notification Preferences

### Staff Portal
1. ✅ Real-time Reservation Dashboard
2. ✅ Interactive Floor Plan
3. ✅ Table Status Manager
4. ✅ Pre-order View (kitchen display)
5. ✅ Customer Feedback View

### Admin Portal
1. ✅ Menu Management
2. ✅ Layout Editor
3. ✅ Policy Configuration
4. ✅ Analytics Dashboard
5. ✅ Report Generator
6. ✅ Feedback Management
7. ✅ User Management (already done)
8. ✅ Payment Management

---

## 📊 **Database Schema Updates Required**

### New Collections:
1. ✅ `MenuItems`
2. ✅ `MenuOrders`
3. ✅ `Feedback`
4. ✅ `Notifications`
5. ✅ `RestaurantLayout`
6. ✅ `ReservationPolicies`

### Updated Collections:
1. ✅ `Reservations` - Add menuOrderId, hasPreOrder
2. ✅ `Tables` - Add position, floor, shape, status
3. ✅ `Payments` - Add Stripe fields, refund info

---

## ✅ **Success Metrics**

After implementation, the system will support:

### Customer Experience
- ✅ Visual table selection
- ✅ Menu pre-ordering
- ✅ Secure online payments
- ✅ Automated notifications
- ✅ Feedback submission

### Staff Efficiency
- ✅ Real-time reservation view
- ✅ Interactive floor plan
- ✅ Table status management
- ✅ Pre-order visibility

### Business Intelligence
- ✅ Comprehensive analytics
- ✅ Configurable policies
- ✅ Customer insights
- ✅ Revenue tracking

---

## 🚀 **Next Steps**

1. **Review this plan** ✅
2. **Start Phase 1 implementation** (Menu + Pre-order + Feedback)
3. **Create database migrations**
4. **Build backend endpoints**
5. **Create frontend components**
6. **Integration testing**
7. **Deploy to production**

---

**Status:** Ready to begin implementation  
**Estimated Time:** 3 weeks for full implementation  
**Priority:** High - Core business features

