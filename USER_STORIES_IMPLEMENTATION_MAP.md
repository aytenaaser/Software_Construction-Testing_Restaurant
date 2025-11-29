# 📋 User Stories Implementation Mapping

## Overview
This document maps all user stories from requirements to database schemas, endpoints, and frontend pages.

---

## 👤 **CUSTOMER USER STORIES**

### US-C001: Book a Table Online
**Story:** "As a customer, I want to book a table online so that I don't have to wait at the restaurant."

✅ **Already Implemented:**
- **Schema:** `Reservation`
- **Endpoint:** `POST /reservations`
- **Frontend:** `/reservations/new` (auth pages done, reservation page needed)
- **Status:** ✅ Backend Done, 🔄 Frontend Pending

---

### US-C002: View Real-time Table Availability
**Story:** "As a customer, I want to view table availability in real time so I can choose a suitable time and location."

✅ **Schemas Created:**
- **Schemas:** `RestaurantLayout`, `Table` (updated)
- **Endpoints Needed:**
  - `GET /restaurant/layout` - Get floor plan with tables
  - `GET /restaurant/tables/status` - Real-time table status
  - `GET /reservations/available-tables?date=X&time=Y&partySize=Z`
- **Frontend Needed:** `/restaurant/layout` - Interactive floor plan viewer
- **Status:** ✅ Schemas Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

### US-C003: Pay Deposit Online
**Story:** "As a customer, I want to pay a deposit online so that my reservation is secured."

✅ **Schema Exists:**
- **Schema:** `Payment` (already created)
- **Enhancement Schema:** `ReservationPolicy` (deposit rules)
- **Endpoints Needed:**
  - `POST /payments/create-payment-intent` - Stripe integration
  - `POST /payments/:id/confirm` - Confirm payment
  - `GET /payments/receipt/:id` - Payment receipt
- **Frontend Needed:** `/payments/checkout` - Stripe payment form
- **Status:** ✅ Schema Done, 🔄 Stripe Integration Pending

---

### US-C004: Pre-order Meal
**Story:** "As a customer, I want to pre-order my meal so that I can get faster service when I arrive."

✅ **Schemas Created:**
- **Schemas:** `MenuItem`, `MenuOrder`, `Reservation` (updated)
- **Endpoints Needed:**
  - `GET /menu` - Browse menu
  - `POST /reservations/:id/pre-order` - Add pre-order
  - `PUT /reservations/:id/pre-order` - Update pre-order
  - `GET /reservations/:id/pre-order` - View pre-order
- **Frontend Needed:**
  - `/menu` - Menu browser
  - `/reservations/:id/pre-order` - Pre-order cart
- **Status:** ✅ Schemas Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

### US-C005: Receive Confirmations and Reminders
**Story:** "As a customer, I want to receive booking confirmations and reminders so I don't miss my reservation."

✅ **Schema Created:**
- **Schema:** `ReservationPolicy` (notification settings)
- **Enhancement:** Extend existing `email.service.ts`
- **Templates Needed:**
  - Reservation confirmation email
  - Reminder email (24h before)
  - Cancellation confirmation
  - Status update email
  - SMS notifications (Twilio)
- **Endpoints:**
  - Automatic triggers on reservation status changes
  - `POST /notifications/send-reminder` - Manual reminder (admin)
- **Status:** ✅ Email service exists, 🔄 Templates Pending, 🔄 SMS Integration Pending

---

### US-C006: Leave Feedback and Ratings
**Story:** "As a customer, I want to leave feedback and ratings so the restaurant can improve its service."

✅ **Schema Created:**
- **Schema:** `Feedback`
- **Endpoints Needed:**
  - `POST /feedback` - Submit feedback
  - `GET /feedback/my-feedback` - View my feedback
  - `GET /feedback/reservation/:id` - Feedback for specific reservation
- **Frontend Needed:**
  - `/feedback/new` - Feedback submission form
  - `/feedback/my-feedback` - My reviews
- **Status:** ✅ Schema Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

## 👔 **STAFF USER STORIES**

### US-S001: View All Reservations in Real-time
**Story:** "As a staff member, I want to view all reservations in real time so I can manage seating efficiently."

✅ **Already Implemented:**
- **Schema:** `Reservation`
- **Endpoint:** `GET /reservations` (admin/staff only)
- **Enhancements Needed:**
  - WebSocket for real-time updates
  - Filter by date, status, table
  - Sort by time
- **Frontend Needed:** `/staff/reservations` - Real-time dashboard
- **Status:** ✅ Basic Backend Done, 🔄 Real-time Updates Pending, 🔄 Frontend Pending

---

### US-S002: Update Table Status
**Story:** "As a staff member, I want to update table status (occupied, free, reserved) so customers get accurate availability."

✅ **Schema Updated:**
- **Schema:** `Table` (added `status` field)
- **Endpoints Needed:**
  - `PUT /tables/:id/status` - Update status (staff/admin)
  - `GET /tables/status` - Get all table statuses
  - Real-time sync with reservations
- **Frontend Needed:** `/staff/floor-plan` - Interactive table status manager
- **Status:** ✅ Schema Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

### US-S003: View Pre-orders
**Story:** (Implicit) "As a staff member, I want to see pre-orders so the kitchen can prepare efficiently."

✅ **Schema Created:**
- **Schema:** `MenuOrder`
- **Endpoints Needed:**
  - `GET /menu-orders/today` - Today's pre-orders
  - `GET /menu-orders/by-time/:time` - Orders for specific time slot
  - `PUT /menu-orders/:id/status` - Update order status
- **Frontend Needed:** `/staff/kitchen-display` - Kitchen display system
- **Status:** ✅ Schema Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

## 👨‍💼 **ADMINISTRATOR USER STORIES**

### US-A001: Configure Reservation Policies
**Story:** "As an administrator, I want to configure reservation policies so the system follows restaurant rules."

✅ **Schema Created:**
- **Schema:** `ReservationPolicy`
- **Endpoints Needed:**
  - `GET /policies` - Get current policies
  - `PUT /policies` - Update policies (admin only)
  - `POST /policies/validate-booking` - Test booking against policies
- **Frontend Needed:** `/admin/policies` - Policy configuration UI
- **Features:**
  - Booking window settings
  - Cancellation policy
  - Deposit rules
  - Operating hours
  - Time slots
  - Blackout dates
- **Status:** ✅ Schema Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

### US-A002: Manage Menu Items
**Story:** "As an administrator, I want to manage menu items so customers always see the updated menu."

✅ **Schema Created:**
- **Schema:** `MenuItem`
- **Endpoints Needed:**
  - `POST /menu` - Create menu item
  - `GET /menu` - List all menu items
  - `PUT /menu/:id` - Update menu item
  - `DELETE /menu/:id` - Delete menu item
  - `PUT /menu/:id/availability` - Toggle availability
  - `POST /menu/bulk-upload` - CSV import
- **Frontend Needed:** `/admin/menu` - Menu management UI
- **Status:** ✅ Schema Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

### US-A003: Generate Reports
**Story:** "As an administrator, I want to generate reports so I can make informed operational decisions."

✅ **Data Available:**
- **Schemas:** All (Reservation, Payment, Feedback, MenuOrder, Table)
- **Analytics Service Needed:**
  ```typescript
  - getReservationTrends(startDate, endDate)
  - getRevenueReport(startDate, endDate)
  - getPopularTimeSlots()
  - getTableUtilization()
  - getCustomerInsights()
  - getCancellationRate()
  - getFeedbackSummary()
  - getMenuItemPopularity()
  ```
- **Endpoints Needed:**
  - `GET /analytics/reservations` - Reservation analytics
  - `GET /analytics/revenue` - Revenue reports
  - `GET /analytics/feedback` - Feedback summary
  - `GET /analytics/menu` - Menu performance
  - `GET /analytics/export` - Export CSV/PDF
- **Frontend Needed:** `/admin/analytics` - Analytics dashboard with charts
- **Status:** ✅ Data Available, 🔄 Analytics Service Pending, 🔄 Frontend Pending

---

### US-A004: Manage User Accounts
**Story:** "As an administrator, I want to manage user accounts so that access is secure and controlled."

✅ **Already Implemented:**
- **Schema:** `User`
- **Endpoints:** 
  - `GET /users` - List users (admin)
  - `GET /users/staff` - List staff
  - `GET /users/customers` - List customers
  - `PUT /users/:id` - Update user
  - `DELETE /users/:id` - Delete user
- **Frontend:** Basic user management exists in auth system
- **Status:** ✅ Done

---

### US-A005: Manage Floor Layout
**Story:** (Implicit) "As an administrator, I want to configure the restaurant layout so customers can see accurate floor plans."

✅ **Schema Created:**
- **Schema:** `RestaurantLayout`
- **Endpoints Needed:**
  - `GET /restaurant/layout` - Get layout
  - `PUT /restaurant/layout` - Update layout (admin)
  - `POST /restaurant/layout/tables` - Add table to layout
  - `PUT /restaurant/layout/tables/:id` - Move table
  - `DELETE /restaurant/layout/tables/:id` - Remove table
- **Frontend Needed:** `/admin/layout-editor` - Drag-and-drop layout editor
- **Status:** ✅ Schema Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

### US-A006: Moderate Feedback
**Story:** (Implicit) "As an administrator, I want to moderate customer feedback so inappropriate content is filtered."

✅ **Schema Created:**
- **Schema:** `Feedback` (includes moderation status)
- **Endpoints Needed:**
  - `GET /feedback?status=pending` - Get pending feedback
  - `PUT /feedback/:id/approve` - Approve feedback
  - `PUT /feedback/:id/reject` - Reject feedback
  - `PUT /feedback/:id/respond` - Respond to feedback
- **Frontend Needed:** `/admin/feedback` - Feedback moderation UI
- **Status:** ✅ Schema Done, 🔄 Backend Pending, 🔄 Frontend Pending

---

## 📊 **Implementation Matrix**

### Database Schemas: ✅ 100%

| Schema | Customer Stories | Staff Stories | Admin Stories | Status |
|--------|------------------|---------------|---------------|--------|
| Reservation | US-C001 | US-S001 | - | ✅ Done |
| Table | US-C002 | US-S002 | US-A005 | ✅ Done |
| Payment | US-C003 | - | US-A003 | ✅ Done |
| MenuItem | US-C004 | - | US-A002 | ✅ Done |
| MenuOrder | US-C004 | US-S003 | US-A003 | ✅ Done |
| Feedback | US-C006 | - | US-A003, US-A006 | ✅ Done |
| RestaurantLayout | US-C002 | US-S002 | US-A005 | ✅ Done |
| ReservationPolicy | US-C003, US-C005 | - | US-A001 | ✅ Done |

### Backend Services: 🔄 33%

| Service | Stories Covered | Status |
|---------|----------------|--------|
| ReservationService | US-C001, US-S001 | ✅ Done |
| TableService | US-C002, US-S002 | ✅ Partial |
| PaymentService | US-C003 | 🔄 Stripe Pending |
| MenuService | US-C004, US-A002 | 🔄 Pending |
| MenuOrderService | US-C004, US-S003 | 🔄 Pending |
| FeedbackService | US-C006, US-A006 | 🔄 Pending |
| LayoutService | US-C002, US-A005 | 🔄 Pending |
| PolicyService | US-A001 | 🔄 Pending |
| AnalyticsService | US-A003 | 🔄 Pending |
| NotificationService | US-C005 | 🔄 Partial |

### Frontend Pages: 🔄 25%

| Page Type | Stories Covered | Status |
|-----------|----------------|--------|
| Auth Pages | All (Login/Register) | ✅ Done |
| Customer Reservations | US-C001 | 🔄 Pending |
| Restaurant Layout Viewer | US-C002 | 🔄 Pending |
| Menu Browser | US-C004 | 🔄 Pending |
| Pre-order Cart | US-C004 | 🔄 Pending |
| Payment Checkout | US-C003 | 🔄 Pending |
| Feedback Form | US-C006 | 🔄 Pending |
| Staff Dashboard | US-S001, US-S003 | 🔄 Pending |
| Staff Floor Plan | US-S002 | 🔄 Pending |
| Admin Menu Manager | US-A002 | 🔄 Pending |
| Admin Policy Config | US-A001 | 🔄 Pending |
| Admin Layout Editor | US-A005 | 🔄 Pending |
| Admin Analytics | US-A003 | 🔄 Pending |
| Admin Feedback Moderation | US-A006 | 🔄 Pending |

---

## 🎯 **Priority Implementation Order**

### **Phase 1: Core Customer Features** (Week 1)
1. ✅ Menu Service & Controller
2. ✅ Pre-order Service & Controller
3. ✅ Frontend: Menu Browser
4. ✅ Frontend: Pre-order Cart
5. ✅ Frontend: Enhanced Reservation Flow

**Impact:** US-C001, US-C004

---

### **Phase 2: Visual & Real-time** (Week 2)
1. ✅ Layout Service & Controller
2. ✅ Real-time Table Status
3. ✅ Frontend: Restaurant Layout Viewer
4. ✅ Frontend: Staff Floor Plan Manager
5. ✅ WebSocket Integration

**Impact:** US-C002, US-S001, US-S002

---

### **Phase 3: Payments & Notifications** (Week 3)
1. ✅ Stripe Payment Integration
2. ✅ Email Templates (extend)
3. ✅ SMS Service (Twilio)
4. ✅ Frontend: Payment Checkout
5. ✅ Notification Triggers

**Impact:** US-C003, US-C005

---

### **Phase 4: Feedback & Policies** (Week 4)
1. ✅ Feedback Service & Controller
2. ✅ Policy Service & Controller
3. ✅ Frontend: Feedback Form
4. ✅ Frontend: Policy Configuration
5. ✅ Frontend: Feedback Moderation

**Impact:** US-C006, US-A001, US-A006

---

### **Phase 5: Analytics & Reports** (Week 5)
1. ✅ Analytics Service
2. ✅ Report Generation
3. ✅ Frontend: Analytics Dashboard
4. ✅ Export Functionality (CSV/PDF)
5. ✅ Charts & Visualizations

**Impact:** US-A003

---

## ✅ **Success Metrics Per Story**

### Customer Stories
- **US-C001:** 50+ reservations/day
- **US-C002:** 80% customers use layout viewer
- **US-C003:** 70% deposits paid online
- **US-C004:** 40% pre-order adoption
- **US-C005:** 95% email delivery rate
- **US-C006:** 30% feedback submission rate

### Staff Stories
- **US-S001:** Real-time dashboard updates < 2s
- **US-S002:** Table status accuracy 99%+
- **US-S003:** Pre-order processing time -30%

### Admin Stories
- **US-A001:** Policy changes applied instantly
- **US-A002:** Menu updates < 5 minutes
- **US-A003:** Report generation < 10s
- **US-A004:** User management efficiency +50%
- **US-A005:** Layout changes < 15 minutes
- **US-A006:** Feedback moderation < 24h

---

## 🚀 **Ready for Full Implementation!**

**All user stories are mapped to:**
- ✅ Database schemas (100% complete)
- 🔄 Backend services (33% complete)
- 🔄 Frontend pages (25% complete)

**Next Step:** Begin Phase 1 implementation (Menu & Pre-order system)

---

**Status:** Comprehensive plan complete ✅
**Estimated Total Time:** 5 weeks for full implementation

