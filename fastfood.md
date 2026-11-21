# Fast-Food Order Management App

## Project Overview

Build a simple, clean, responsive web application for a small fast-food business that currently manages customer orders using handwritten paper.

The business has only around 5 menu items, so the application should be extremely simple and fast to use. Do not build a complicated restaurant management system.

The primary goal is:

**Take Order → Send to Kitchen → Prepare → Complete → Record Payment → Track Sales**

The application should be optimized for desktop, tablet, and mobile screens.

---

## Technology Stack

Use:

* Frontend: React
* Styling: Tailwind CSS
* Backend: Laravel REST API
* Database: MySQL
* Authentication: Laravel Sanctum
* API communication: Axios
* Frontend routing: React Router

Use a clean and maintainable project structure.

---

# 1. Authentication

Create a basic authentication system.

Required:

* Login
* Logout
* Authenticated routes
* User roles

Initially support:

### Admin

Can:

* Manage menu items
* View orders
* View sales
* Manage users
* View dashboard

### Staff

Can:

* Create orders
* View orders
* Send orders to kitchen
* Update order status
* Record payments

Keep role management simple for the MVP.

---

# 2. Dashboard

After login, show a simple dashboard.

Display:

* Today's total orders
* Today's total sales
* Today's completed orders
* Pending kitchen orders
* Average order value

Example:

Today's Orders: 42

Today's Sales: Rs. 8,450

Pending Orders: 4

Average Order: Rs. 201

Also show a simple "Popular Items Today" section.

Example:

Chicken Momo — 28
Chowmein — 17
Burger — 12
French Fries — 9
Buff Momo — 7

The dashboard should be simple and useful rather than visually overloaded.

---

# 3. Menu Management

Create a menu management module.

Each menu item should have:

* ID
* Name
* Description
* Price
* Image (optional)
* Availability status
* Created date
* Updated date

Admin should be able to:

* Create menu item
* Edit menu item
* Delete menu item
* Change price
* Mark item as available/unavailable

Example initial menu:

1. Chicken Momo — Rs. 150
2. Buff Momo — Rs. 130
3. Chowmein — Rs. 140
4. Burger — Rs. 180
5. French Fries — Rs. 120

Do not hardcode these items. Store them in the database.

If an item is marked unavailable, it should not be selectable when creating an order.

---

# 4. Quick Order Screen

This is the most important screen in the application.

Design it for very fast order entry.

Display available menu items as large buttons/cards.

Example:

Chicken Momo
Rs. 150
[ + ]

Buff Momo
Rs. 130
[ + ]

Chowmein
Rs. 140
[ + ]

Burger
Rs. 180
[ + ]

French Fries
Rs. 120
[ + ]

When the staff clicks an item, add it to the current order.

The current order should appear on the same screen.

Example:

CURRENT ORDER

Chicken Momo     x2     Rs. 300
Chowmein         x1     Rs. 140
French Fries     x1     Rs. 120

Subtotal: Rs. 560
Discount: Rs. 0
Total: Rs. 560

Buttons:

[ Clear Order ]

[ Send to Kitchen ]

Allow staff to:

* Increase quantity
* Decrease quantity
* Remove an item
* Clear the entire order

---

# 5. Order Type

When creating an order, allow:

* Dine-in
* Takeaway

If dine-in is selected, optionally allow a table number.

Do not implement complicated table management unless required.

---

# 6. Order Creation

When the staff clicks "Send to Kitchen":

Create an order in the database.

Generate a unique order number.

Example:

#1042

Save:

* Order number
* Order type
* Ordered items
* Quantity
* Unit price
* Total
* Staff/user who created it
* Order status
* Created timestamp

Initial status:

NEW

After successfully creating the order, clear the current order and show confirmation.

Example:

"Order #1042 sent to kitchen."

---

# 7. Kitchen Display

Create a dedicated kitchen screen.

Display active orders in cards.

Order statuses:

NEW → PREPARING → COMPLETED

Example:

ORDER #1042

Chicken Momo × 2
Chowmein × 1
French Fries × 1

Order Type: Takeaway
Time: 5:42 PM

[ Start Preparing ]

After clicking:

PREPARING

[ Mark Completed ]

After clicking:

COMPLETED

Completed orders should disappear from the active kitchen queue or move to a completed section.

Use clear visual status indicators.

The kitchen interface should require minimal interaction.

---

# 8. Order Management

Create an order management page.

Display:

* Order number
* Date/time
* Order type
* Status
* Total
* Payment status
* Payment method
* Staff

Allow filtering by:

* Today
* Date range
* Status
* Payment status

Allow opening an order to see its details.

Example:

Order #1042

Chicken Momo × 2 — Rs. 300
Chowmein × 1 — Rs. 140
French Fries × 1 — Rs. 120

Total: Rs. 560

Status: Completed

Payment: Cash
Payment Status: Paid

---

# 9. Payment

Support only two payment methods initially:

* Cash
* QR / Digital Payment

When completing an order, allow the staff to select the payment method.

Payment status:

* Pending
* Paid

For the MVP, do not integrate a payment gateway.

The application only needs to record how the customer paid.

---

# 10. Sales

Create a simple sales report.

Show:

* Total sales
* Total orders
* Cash sales
* QR sales
* Number of items sold

Allow selecting:

* Today
* Yesterday
* This week
* This month
* Custom date range

Also show sales by menu item.

Example:

Chicken Momo
28 sold
Rs. 4,200

Chowmein
17 sold
Rs. 2,380

Burger
12 sold
Rs. 2,160

---

# 11. Database Design

Create the following tables.

## users

* id
* name
* email
* password
* role
* timestamps

## menus

* id
* name
* description
* price
* image
* is_available
* timestamps

## orders

* id
* order_number
* order_type
* status
* subtotal
* discount
* total
* payment_status
* payment_method
* table_number
* ordered_by
* timestamps

## order_items

* id
* order_id
* menu_id
* quantity
* unit_price
* total
* timestamps

Use proper foreign keys and indexes.

Use database transactions when creating orders and order items.

---

# 12. API Structure

Create REST APIs following Laravel conventions.

Example:

Authentication:

POST /api/login
POST /api/logout
GET /api/me

Menus:

GET /api/menus
POST /api/menus
GET /api/menus/{id}
PUT /api/menus/{id}
DELETE /api/menus/{id}

Orders:

GET /api/orders
POST /api/orders
GET /api/orders/{id}
PUT /api/orders/{id}

Kitchen:

GET /api/kitchen/orders
PUT /api/kitchen/orders/{id}/status

Dashboard:

GET /api/dashboard

Reports:

GET /api/reports/sales

Use Laravel Form Requests for validation.

Use API Resources where appropriate.

Return consistent JSON responses.

---

# 13. UI/UX Requirements

The UI should be clean, modern, and professional.

Prioritize speed over visual complexity.

Important requirements:

* Responsive design
* Mobile friendly
* Tablet friendly
* Large buttons for menu items
* Clear order totals
* Minimal clicks
* Clear status indicators
* Confirmation messages
* Loading states
* Empty states
* Error handling
* Form validation
* Confirmation before destructive actions

The Quick Order screen should be the easiest and fastest screen to use.

Use Tailwind CSS.

Avoid unnecessary animations and complicated UI components.

---

# 14. Navigation

Create a simple sidebar/navigation.

Admin:

Dashboard
Quick Order
Orders
Kitchen
Menu
Sales
Users
Settings

Staff:

Quick Order
Orders
Kitchen

Hide unauthorized modules based on the user's role.

---

# 15. Order Workflow

Implement this exact workflow:

Customer places order.

↓

Staff opens Quick Order.

↓

Staff selects menu items and quantities.

↓

Staff selects Dine-in or Takeaway.

↓

Staff clicks "Send to Kitchen".

↓

System creates the order.

↓

Kitchen receives the order.

↓

Kitchen changes status:

NEW → PREPARING

↓

Kitchen prepares the food.

↓

Kitchen changes status:

PREPARING → COMPLETED

↓

Staff records payment.

↓

Order becomes:

COMPLETED + PAID

↓

Sales report includes the order.

---

# 16. MVP Scope

Do NOT implement the following in the first version:

* Customer registration
* Customer mobile application
* Loyalty points
* Delivery tracking
* Complex inventory management
* Payroll
* Supplier management
* Accounting
* Multi-branch support
* Online payment gateway
* AI forecasting
* Advanced analytics

Keep the application focused on:

**Orders + Kitchen + Payments + Basic Sales**

---

# 17. Development Approach

Build the application incrementally.

Phase 1:

* Laravel project setup
* React project setup
* MySQL configuration
* Authentication
* User roles

Phase 2:

* Menu management
* Menu API
* Quick Order UI

Phase 3:

* Order creation
* Order items
* Order history

Phase 4:

* Kitchen display
* Order status workflow

Phase 5:

* Payment recording
* Sales dashboard

Phase 6:

* Reports
* Filtering
* UI/UX refinement
* Validation
* Error handling
* Testing

---

# 18. Coding Requirements

Follow clean architecture and Laravel best practices.

Use:

* Controllers
* Form Requests
* API Resources
* Services where business logic becomes complex
* Eloquent relationships
* Database transactions
* Proper validation
* Authentication middleware
* Role/permission middleware
* Environment variables
* Meaningful naming conventions

Do not put large amounts of business logic directly inside controllers.

Use reusable React components.

Keep API calls organized in a dedicated frontend service/API layer.

Use reusable components for:

* Buttons
* Modals
* Tables
* Status badges
* Form inputs
* Loading states
* Error messages

---

# 19. Important Requirement

Before implementing each phase:

1. Inspect the existing project structure.
2. Explain what you are going to build.
3. Identify the files that need to be created or modified.
4. Implement the feature.
5. Run appropriate tests or validation.
6. Fix errors.
7. Summarize what was implemented.
8. Do not move to the next major phase until the current phase is working.

Do not generate unnecessary features.

Prioritize a simple, reliable workflow that a small fast-food shop employee can learn within a few minutes.

The final application should feel like a lightweight POS/order management system rather than a large restaurant ERP.
