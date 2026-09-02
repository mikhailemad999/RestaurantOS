const restaurantOSRoleBasedOperationsPrompt = `
============================================================
RESTAURANTOS — ROLE-BASED OPERATIONS & ISOLATED WORKSPACES
MASTER JSON PROMPT
============================================================

You are a PRINCIPAL SOFTWARE ARCHITECT, SENIOR SECURITY ENGINEER,
SENIOR DJANGO ENGINEER, SENIOR REACT ENGINEER, DATABASE ARCHITECT,
UX/UI DESIGNER, QA ENGINEER and RESTAURANT OPERATIONS SPECIALIST.

You are extending an existing RestaurantOS application.

The objective of this feature is to create completely separated
employee experiences.

Each employee role must have:

- Its own login mode
- Its own workspace
- Its own dashboard
- Its own navigation
- Its own permissions
- Its own operational screens
- Only the data required for the job
- No access to unrelated settings
- No access to unauthorized reports
- No access to other employee workspaces

The user must never feel that they are using an application
containing features they are not allowed to use.

============================================================
1. CORE PRODUCT RULE
============================================================

AFTER LOGIN:

DO NOT SHOW THE ENTIRE APPLICATION.

Instead:

Authenticate User
        ↓
Load Role
        ↓
Load Branch
        ↓
Load Permissions
        ↓
Load Feature Flags
        ↓
Load User Workspace
        ↓
Redirect to Role-Specific Home Screen

Example:

Manager
→ Manager Workspace

Cashier
→ Cashier Workspace

Captain
→ Captain Workspace

Chef
→ Kitchen Workspace

Driver
→ Driver Workspace

Owner
→ Owner Workspace

============================================================
2. SECURITY PRINCIPLE
============================================================

IMPORTANT:

Hiding a page in React is NOT security.

Every permission must also be verified on the backend.

Frontend:
- Hide unauthorized menu items
- Hide unauthorized buttons
- Redirect unauthorized pages
- Show only allowed workspace

Backend:
- Validate authentication
- Validate role
- Validate permission
- Validate branch access
- Validate resource ownership
- Validate action

A user must never access unauthorized information
by manually entering an API URL.

Example:

/api/reports/financial/

must return HTTP 403 for a cashier without permission.

============================================================
3. ROLE WORKSPACES
============================================================

Create separate workspaces:

OWNER_WORKSPACE
MANAGER_WORKSPACE
CASHIER_WORKSPACE
CAPTAIN_WORKSPACE
CHEF_WORKSPACE
DRIVER_WORKSPACE
PACKING_WORKSPACE
BAR_WORKSPACE
INVENTORY_WORKSPACE
CALL_CENTER_WORKSPACE

Optional:

ACCOUNTING_WORKSPACE
HR_WORKSPACE
SUPERVISOR_WORKSPACE

The system must support custom roles later.

============================================================
4. OWNER LOGIN
============================================================

Route:

/login/owner

After login:

/owner

Owner sees:

- Global Dashboard
- All Branches
- All Brands
- Consolidated Sales
- Consolidated Profit
- Multi-branch BI
- Business Settings
- Subscription
- Security
- Audit Logs
- Users
- Roles
- High-level Financial Reports
- System Health

Owner does NOT need daily operational screens by default.

Owner can access them only when explicitly permitted.

============================================================
5. OWNER WORKSPACE
============================================================

Navigation:

Dashboard
Branches
Brands
Financial
Analytics
Customers
Operations
Staff
Security
Audit
Settings
System Health

Dashboard:

- Total Revenue
- Profit
- Branch Performance
- Customer Growth
- Food Cost
- Waste
- Sales Targets
- Critical Alerts

Owner actions:

- View branches
- Compare branches
- Manage high-level configuration
- Review financial performance
- Review audit
- Manage organization

Sensitive owner actions require strong authorization.

============================================================
6. MANAGER LOGIN
============================================================

Route:

/login/manager

Redirect:

/manager

Manager workspace includes:

- Dashboard
- POS if permitted
- Tables
- Orders
- Kitchen
- Delivery
- Inventory
- Menu
- Customers
- Reservations
- Staff
- Reports
- Printer Settings
- Branch Operations
- Approvals
- Alerts
- Settings

Manager sees operational data only for assigned branch
unless they have multi-branch permissions.

============================================================
7. MANAGER DASHBOARD
============================================================

Show:

Today Sales
Today Orders
Average Order
Food Cost
Waste
Open Tables
Kitchen Queue
Delivery Queue
Low Stock
Reservations
Cash Variance
Critical Alerts

Quick actions:

New Order
Open Tables
Kitchen
Inventory
Reports
Staff
Printer Settings

Manager should not be overwhelmed with low-level employee controls.

============================================================
8. CASHIER LOGIN
============================================================

Route:

/login/cashier

Redirect:

/cashier

Cashier workspace must contain only POS operations.

Navigation:

POS
Orders
Customers
Shift
Payments
Receipts

Optional:

Tables if cashier is authorized.

DO NOT SHOW:

- Financial management
- Inventory
- Supplier settings
- Menu management
- User management
- Permissions
- Printer configuration
- Business settings
- Branch settings
- Advanced BI
- Payroll
- Security configuration

============================================================
9. CASHIER HOME SCREEN
============================================================

Dashboard:

Current Shift
Today's Orders
Current Sales
Open Payments
Pending Orders

Main buttons:

NEW ORDER
OPEN TABLE
DELIVERY
TAKEAWAY
CUSTOMER SEARCH
SHIFT

The cashier should reach POS in one click.

============================================================
10. CASHIER POS
============================================================

POS must support only allowed operations:

- New order
- Select order type
- Select customer
- Select table if allowed
- Search product
- Add product
- Add modifier
- Add note
- Apply allowed discount
- Send to kitchen
- Payment
- Print receipt
- Reprint if permitted

Sensitive actions require permission:

- Refund
- Cancel paid order
- Price override
- Large discount
- Cash adjustment

============================================================
11. CAPTAIN / WAITER LOGIN
============================================================

Route:

/login/captain

Redirect:

/captain

Captain workspace:

- My Tables
- Floor Plan
- New Order
- Active Orders
- Bill Requests
- Notifications

DO NOT SHOW:

- Financial reports
- Inventory
- Supplier management
- Staff
- User permissions
- Printer configuration
- Business settings

============================================================
12. CAPTAIN DASHBOARD
============================================================

Show only:

My Tables
Occupied Tables
Available Tables
Bill Requests
Ready Orders
Notifications

Example:

MY TABLES

Table 4
Table 8
Table 12
Table 15

============================================================
13. CAPTAIN TABLE OPERATIONS
============================================================

Captain can:

- Open assigned table
- View table
- Seat guests
- Create order
- Add products
- Modify order before allowed state
- Add modifiers
- Add customer notes
- Send to kitchen
- Request bill
- Transfer table if authorized
- Merge tables if authorized

Cannot:

- Change system settings
- Change prices
- Change employee permissions
- Modify financial reports
- Configure printers

============================================================
14. CHEF LOGIN
============================================================

Route:

/login/chef

Redirect:

/chef

Chef must NEVER see the normal administration UI.

The chef workspace should be a dedicated Kitchen Display application.

Navigation:

Kitchen
Stations
Orders
My Station
Problems

Optional:

Inventory availability only.

============================================================
15. CHEF WORKSPACE
============================================================

Chef sees:

NEW
PREPARING
READY
DELAYED

Station filter:

Pizza
Sandwich
Grill
Fryer
Bar
Dessert
Assembly

Chef only sees stations assigned to them
unless authorized as kitchen supervisor.

============================================================
16. CHEF ORDER CARD
============================================================

Display:

Order Number
Order Type
Table / Pickup / Delivery
Time
Priority
Items
Quantities
Modifiers
Kitchen Notes

Example:

ORDER #10520

TABLE 12

2 x Chicken Ranch Pizza
LARGE
+ Extra Cheese
- Onion

NOTE:
Cut into 8 pieces.

[START]
[READY]

============================================================
17. CHEF DATA PRIVACY
============================================================

Chef should NOT see by default:

- Customer phone
- Customer address
- Payment details
- Customer lifetime spend
- Financial reports
- Staff salaries

Only show information required to prepare the food.

For delivery:

Chef may see:

DELIVERY ORDER

but not necessarily the full customer address.

Packing/dispatch users receive relevant address information.

============================================================
18. STATION-SPECIFIC CHEF LOGIN
============================================================

Optional specialized login:

/login/kitchen

After selecting station:

/kitchen/pizza
/kitchen/sandwich
/kitchen/grill
/kitchen/fryer
/kitchen/bar

A pizza employee should see:

ONLY PIZZA QUEUE.

A bar employee should see:

ONLY BAR QUEUE.

============================================================
19. PIZZA WORKSPACE
============================================================

Screen:

PIZZA STATION

Columns:

NEW
PREPARING
READY

Cards include:

Order
Pizza
Size
Quantity
Modifiers
Notes
Timer

============================================================
20. SANDWICH WORKSPACE
============================================================

Screen:

SANDWICH STATION

Only sandwich items.

Support:

Bread
Size
Sauce
Extras
Removed ingredients
Cooking notes

============================================================
21. BAR WORKSPACE
============================================================

Screen:

BAR

Show:

Drink
Size
Ice
Sugar
Milk
Syrup
Extras
Quantity
Notes

Do not show irrelevant food items.

============================================================
22. PACKING LOGIN
============================================================

Route:

/login/packing

Redirect:

/packing

Packing team sees:

- Ready orders
- Missing items
- Order type
- Order number
- Customer name where required
- Delivery/pickup information
- Packaging instructions

Actions:

Check Item
Mark Packed
Report Missing
Request Kitchen Correction

============================================================
23. DRIVER LOGIN
============================================================

Route:

/login/driver

Redirect:

/driver

Driver sees ONLY:

- Assigned deliveries
- Customer delivery information
- Navigation
- Call customer
- Delivery notes
- Amount to collect
- Delivery status

DO NOT SHOW:

- Other customer orders
- Restaurant reports
- Kitchen settings
- Inventory
- Other drivers' private information
- Staff management

============================================================
24. DRIVER DASHBOARD
============================================================

Show:

Today's Deliveries
Active Delivery
Completed Deliveries
Cash To Settle

Example:

ACTIVE DELIVERY

#10520
Ahmed Mohamed
01012345678
New Cairo
Street 90
Building 15

Amount:
450 EGP

[CALL]
[MAP]
[START]
[DELIVERED]

============================================================
25. CALL CENTER LOGIN
============================================================

Route:

/login/call-center

Redirect:

/call-center

Call-center agent sees:

- Customer search
- Phone search
- Customer profile limited
- Address selection
- Previous orders
- Repeat order
- New order
- Delivery
- Takeaway

DO NOT SHOW:

- Inventory
- Kitchen settings
- Financial reports
- Staff management
- Printer settings

============================================================
26. INVENTORY USER LOGIN
============================================================

Route:

/login/inventory

Redirect:

/inventory

Inventory employee sees:

- Stock
- Receiving
- Transfers
- Stock Count
- Waste
- Purchase Requests

Can NOT:

- Process payments
- View customer payment details
- Manage users
- Change restaurant settings

============================================================
27. ACCOUNTING LOGIN
============================================================

Optional role:

/login/accounting

Workspace:

/accounting

Show:

- Revenue
- Taxes
- Expenses
- Payments
- Refunds
- Supplier balances
- Financial exports

Do NOT show:

- Kitchen
- Customer private operational data
- Staff permissions

============================================================
28. HR LOGIN
============================================================

Optional role:

/login/hr

Show:

- Employees
- Attendance
- Schedule
- Payroll configuration
- Leave

Do not show:

- Customer orders
- Payment data
- Kitchen details

============================================================
29. ROLE LANDING PAGE
============================================================

Never redirect every user to /dashboard.

Instead:

OWNER
→ /owner

MANAGER
→ /manager

CASHIER
→ /cashier

CAPTAIN
→ /captain

CHEF
→ /chef

DRIVER
→ /driver

PACKING
→ /packing

INVENTORY
→ /inventory

CALL_CENTER
→ /call-center

ACCOUNTING
→ /accounting

HR
→ /hr

============================================================
30. LOGIN DESIGN
============================================================

Create professional login system.

Option A:

Unified login:

/login

User enters:

Username / Phone / Email
Password or PIN

System detects role.

Option B:

Role-specific login:

/login/cashier
/login/captain
/login/chef
/login/driver
/login/manager

Both models may be supported.

Recommended:

Unified authentication backend
+
role-specific login UI.

============================================================
31. PIN LOGIN
============================================================

For operational employees:

Cashier
Captain
Chef
Driver

Allow optional PIN login.

Example:

Select profile
Enter PIN

Backend validates:

- PIN
- User status
- Branch
- Active shift
- Permissions

Never store plaintext PINs.

============================================================
32. DEVICE BINDING
============================================================

Optional security:

Manager can assign device to role.

Example:

POS Terminal 1
→ Cashier Station

Kitchen Tablet 1
→ Pizza Station

Kitchen Tablet 2
→ Sandwich Station

Driver Phone
→ Driver

This simplifies operations.

============================================================
33. DEVICE WORKSPACE
============================================================

When a device is assigned:

POS device loads cashier workspace.

Kitchen tablet loads assigned station.

Packing screen loads packing workspace.

The user still authenticates before accessing protected data.

============================================================
34. ROLE SWITCHING
============================================================

Do NOT provide unrestricted role switching.

If user has multiple roles:

Example:

Manager + Cashier

Provide:

"Switch Workspace"

Only between roles explicitly assigned to that user.

Every switch is logged.

============================================================
35. BREAK-GLASS ACCESS
============================================================

Allow controlled emergency access.

Example:

Chef needs manager assistance.

Chef can request:

"Manager Approval"

Manager enters PIN.

Temporary action is granted.

Record:

- Request
- Manager
- Permission
- Time
- Action

Permission automatically expires.

============================================================
36. STAFF PROFILE
============================================================

Each employee has:

- User
- Role(s)
- Branch
- Department
- Station
- Language
- Device
- Status
- Shift

============================================================
37. ROLE PERMISSION MODEL
============================================================

Use granular permissions.

Examples:

dashboard.view
pos.view
order.create
order.edit
order.cancel
order.refund
order.discount
order.price_override
table.view
table.manage
customer.search
customer.view
customer.edit
kitchen.view
kitchen.start
kitchen.ready
kitchen.recall
printer.print
printer.reprint
printer.manage
inventory.view
inventory.adjust
purchase.create
purchase.approve
report.view
report.financial
report.export
staff.view
staff.manage
role.manage
settings.view
settings.manage
audit.view

============================================================
38. WORKSPACE PERMISSION MATRIX
============================================================

OWNER:

Everything.

MANAGER:

Most operational + management features.

CASHIER:

POS + customers + shift + payments + receipts.

CAPTAIN:

Tables + orders + assigned customer functions.

CHEF:

Kitchen station only.

DRIVER:

Assigned delivery only.

PACKING:

Packing queue only.

INVENTORY:

Inventory and purchasing only.

CALL_CENTER:

Customer + order creation only.

ACCOUNTING:

Financial/accounting only.

HR:

Employee/attendance only.

============================================================
39. BRANCH ACCESS
============================================================

A manager assigned to Branch A must not access Branch B
unless explicitly granted.

Example:

User:
Ahmed

Role:
Manager

Allowed branches:
Branch A

API request:

GET /api/v1/orders/?branch=BranchB

Must return:

403 Forbidden

unless branch access is granted.

============================================================
40. DATA SCOPE
============================================================

Permissions should support scopes:

OWN
ASSIGNED
BRANCH
ALL_BRANCHES
ORGANIZATION

Example:

Captain:
orders = ASSIGNED_TABLES

Cashier:
orders = CURRENT_SHIFT / BRANCH

Manager:
orders = BRANCH

Owner:
orders = ALL_BRANCHES

============================================================
41. NAVIGATION GENERATION
============================================================

Do not hardcode navigation separately for every role.

Create permission-aware navigation configuration.

Example:

if permission:
  show menu item

else:
  hide it

But API access must still be protected.

============================================================
42. DASHBOARD GENERATION
============================================================

Each workspace gets a dashboard specifically designed for its role.

Manager:

Business KPIs

Cashier:

Current Shift

Captain:

Tables

Chef:

Kitchen Queue

Driver:

Deliveries

Inventory:

Stock

Accounting:

Financials

HR:

Employees

============================================================
43. SEARCH SECURITY
============================================================

Global search must respect permissions.

Cashier searching customer:

Allowed customer data only.

Chef searching:

No global customer search by default.

Driver:

Only assigned deliveries.

Manager:

Branch data.

Owner:

Organization data.

============================================================
44. CUSTOMER DATA VISIBILITY
============================================================

Define fields by role.

Cashier:

- Name
- Phone
- Address
- Order history needed for service

Captain:

- Name
- Relevant customer notes

Chef:

- Food-related notes only

Driver:

- Name
- Phone
- Address
- Delivery note

Manager:

Full operational customer view.

Owner:

According to organization permissions.

============================================================
45. FINANCIAL DATA VISIBILITY
============================================================

Chef:
NO

Captain:
NO

Driver:
ONLY amount to collect where required

Cashier:
Payment amount for current order

Manager:
Financial reports if permitted

Accounting:
Financial data

Owner:
Full financial data

============================================================
46. STAFF DATA VISIBILITY
============================================================

Do not expose:

- Salary
- Personal information
- HR notes

to ordinary operational users.

============================================================
47. SETTINGS ISOLATION
============================================================

CRITICAL:

Most users should see NO settings page.

Cashier:
No Settings

Captain:
No Settings

Chef:
No Settings

Driver:
No Settings

Packing:
No Settings

Inventory:
Only inventory configuration if explicitly permitted

Manager:
Operational settings

Owner:
Global settings

============================================================
48. PRINTER SETTINGS
============================================================

Only:

Owner
Manager
Authorized technical/admin user

can access:

/settings/printers

Chef can only use the printer.

Cashier can only print/reprint allowed documents.

Chef cannot change printer IP.

============================================================
49. MENU SETTINGS
============================================================

Chef:

May optionally mark item unavailable.

Cashier:

Can view menu.

Manager:

Can manage menu.

Owner:

Can manage global menu.

Only authorized users can change:

- Price
- Recipe
- Tax
- Availability
- Modifier structure

============================================================
50. INVENTORY SETTINGS
============================================================

Chef:

Can see limited ingredient availability.

Inventory employee:

Full inventory operations.

Manager:

Full branch inventory.

Owner:

All branches.

============================================================
51. REPORT ISOLATION
============================================================

Cashier:

Daily operational totals only if configured.

Captain:

No financial reports.

Chef:

Kitchen performance only.

Driver:

Delivery performance only.

Manager:

Branch reports.

Owner:

All reports.

Accounting:

Financial reports.

============================================================
52. AUDIT LOG VISIBILITY
============================================================

Chef:
No audit logs.

Cashier:
No audit logs.

Captain:
No audit logs.

Manager:
Branch audit logs.

Owner:
All audit logs.

Security administrators:
Security events.

============================================================
53. USER MANAGEMENT
============================================================

Only:

Owner
Manager with permission

can manage staff.

Cashier cannot create cashier accounts.

Captain cannot create captains.

Chef cannot create chef accounts.

============================================================
54. MANAGER USER CREATION
============================================================

Manager selects:

Create Employee

Then:

Name
Phone
Role
Branch
Department
Station
Language
PIN
Permissions

Manager may only assign permissions
within their authority.

Example:

A manager cannot grant themselves Owner permissions.

============================================================
55. CUSTOM ROLES
============================================================

Support:

Create Role

Example:

"Shift Supervisor"

Permissions:

- POS
- Tables
- Cash
- Limited Reports

No settings.

============================================================
56. ROLE HIERARCHY
============================================================

Define role authority levels.

Example:

OWNER = 100
MANAGER = 80
SUPERVISOR = 70
ACCOUNTING = 60
CASHIER = 40
CAPTAIN = 35
CHEF = 30
PACKING = 25
DRIVER = 20

Do not rely solely on numeric hierarchy.

Use explicit permissions.

============================================================
57. USER SESSION
============================================================

Session must include:

- user_id
- role
- branch
- permissions
- language
- workspace
- device
- session_id

Do not trust role supplied by frontend.

============================================================
58. TOKEN CLAIMS
============================================================

Can include:

user_id
session_id
branch_id

Avoid putting an enormous permission list
inside long-lived tokens.

Backend should remain authoritative.

============================================================
59. SESSION TIMEOUT
============================================================

Operational devices:

Configurable timeout.

Example:

Cashier:
15 minutes

Kitchen:
Long-running session with device authentication

Manager:
Configurable shorter secure timeout

Allow managers to configure.

============================================================
60. AUTO LOCK
============================================================

When inactive:

Screen locks.

User enters PIN again.

Do not necessarily log out from application.

============================================================
61. QUICK USER SWITCH
============================================================

On shared POS:

Cashier A
→ lock
→ Cashier B enters PIN

This creates a new authenticated session context.

============================================================
62. SHARED TERMINAL SAFETY
============================================================

When switching users:

Clear:

- Customer sensitive data
- Current temporary data if not saved
- Previous user notifications
- Previous user permissions

Never allow previous session to leak into next user's workspace.

============================================================
63. ROLE-SPECIFIC COLORS
============================================================

Each workspace can have subtle identity:

Manager:
Professional management theme

Cashier:
High-speed POS theme

Chef:
Kitchen-focused high-contrast theme

Driver:
Mobile navigation theme

Do not make themes confusing.

Maintain common RestaurantOS branding.

============================================================
64. ROLE-SPECIFIC LANGUAGE
============================================================

Every user chooses:

English
or
Arabic

Manager may use English.

Cashier may use Arabic.

Chef may use Arabic.

Driver may use English.

Each user is independent.

Arabic workspace uses RTL.

English workspace uses LTR.

============================================================
65. ROLE-SPECIFIC NOTIFICATIONS
============================================================

Only notify relevant roles.

Example:

Kitchen ready:
→ Captain

Low stock:
→ Manager / Inventory

New delivery:
→ Kitchen / Packing / Dispatch

Cash variance:
→ Manager

New reservation:
→ Manager / Captain

Do not send irrelevant notifications.

============================================================
66. ROLE-SPECIFIC REAL-TIME EVENTS
============================================================

WebSocket subscriptions must be permission aware.

Chef receives:

KITCHEN_TICKET_CREATED

Captain receives:

ORDER_READY

Driver receives:

DELIVERY_ASSIGNED

Manager receives:

BUSINESS_ALERT

Cashier receives:

PAYMENT_CONFIRMATION

Do not broadcast sensitive events to every connected client.

============================================================
67. FRONTEND ROUTE GUARD
============================================================

Create:

ProtectedRoute

PermissionRoute

RoleRoute

BranchRoute

Example:

<RoleRoute role="CHEF">
   <ChefWorkspace />
</RoleRoute>

Unauthorized:
redirect to /forbidden

============================================================
68. FORBIDDEN PAGE
============================================================

Create:

/403

English:

"You don't have permission to access this page."

Arabic:

"ليس لديك صلاحية للوصول إلى هذه الصفحة."

Provide:

[GO TO MY WORKSPACE]

============================================================
69. NOT FOUND PAGE
============================================================

Create:

/404

Do not expose whether unauthorized resources exist.

============================================================
70. BACKEND AUTHORIZATION
============================================================

Every sensitive ViewSet/API must validate:

Authentication
+
Permission
+
Branch Scope
+
Resource Scope

Example:

Can user edit order?

Check:

- authenticated?
- order belongs to accessible branch?
- user has order.edit?
- order state permits edit?

============================================================
71. RESOURCE LEVEL SECURITY
============================================================

Permissions must work at object level.

Example:

Captain can edit:
Orders for assigned tables.

Captain cannot edit:
Another captain's restricted order.

============================================================
72. DELEGATION
============================================================

Manager can temporarily delegate certain permission.

Example:

Shift Supervisor gets:

cash.close

for today's shift only.

Delegation must have:

- start time
- end time
- permission
- creator
- reason

============================================================
73. EMERGENCY MANAGER OVERRIDE
============================================================

Example:

Cashier attempts refund.

System:

"Manager approval required."

Manager scans/enters PIN.

System performs permitted action.

Audit:

Cashier requested
Manager approved
Timestamp
Order
Amount
Reason

============================================================
74. WORKSPACE CONFIGURATION
============================================================

Each workspace can have:

- widgets
- quick actions
- visible modules
- shortcuts

Manager can configure allowed workspace widgets.

But workspace customization must never exceed permissions.

============================================================
75. ROLE DASHBOARD EXAMPLES
============================================================

CASHIER:

Current Shift
New Order
Delivery
Takeaway
Tables
Payments

CAPTAIN:

My Tables
Open Orders
Ready Orders
Bill Requests

CHEF:

New Tickets
Preparing
Ready
Delayed

DRIVER:

Assigned
Pickup
Out for Delivery
Completed

MANAGER:

Sales
Profit
Inventory
Kitchen
Delivery
Staff
Alerts

OWNER:

Business
Branches
Profit
Analytics
Security

============================================================
76. ROLE LOGIN ROUTES
============================================================

/login
/login/owner
/login/manager
/login/cashier
/login/captain
/login/chef
/login/driver
/login/packing
/login/inventory
/login/call-center
/login/accounting
/login/hr

All login routes use the same secure authentication backend.

============================================================
77. LOGIN SECURITY
============================================================

Support:

- Password
- PIN
- MFA for management
- Rate limiting
- Lockout
- Session management
- Device tracking
- Logout
- Force logout

============================================================
78. PERMISSION UI
============================================================

Manager sees permission matrix.

Example:

Role:
Cashier

POS:
YES

Refund:
NO

Inventory:
NO

Users:
NO

Reports:
LIMITED

Settings:
NO

============================================================
79. PERMISSION PREVIEW
============================================================

Before saving role:

Show:

"This user will be able to:"

POS
Orders
Payments

"Will NOT be able to:"

Inventory
Reports
Settings
Users

============================================================
80. ACCESS REVIEW
============================================================

Manager can open:

Employee
→ Access Review

See:

Role
Permissions
Branch
Device
Last login
Last activity

============================================================
81. SECURITY ALERTS
============================================================

Alert manager when:

- User attempts unauthorized endpoint repeatedly
- Suspicious permission requests
- Multiple failed PIN attempts
- Login from unexpected device
- Account used from unusual branch

============================================================
82. AUDIT USER ACCESS
============================================================

Track:

Login
Logout
Role switch
Permission changes
Access denied
Manager override
Session lock
Session unlock

============================================================
83. API RESPONSE
============================================================

Unauthorized:

HTTP 401

Authenticated but unauthorized:

HTTP 403

Do not return excessive details.

============================================================
84. DATABASE SECURITY TABLES
============================================================

Create/extend:

User
Role
Permission
RolePermission
UserRole
UserPermissionOverride
BranchAccess
Workspace
WorkspacePermission
Device
UserSession
PermissionDelegation
AccessAuditLog

============================================================
85. USER ROLE RELATIONSHIP
============================================================

Support one or more roles if explicitly configured.

Example:

Employee:

Roles:
CAPTAIN
SHIFT_SUPERVISOR

Effective permissions:

Union of explicitly allowed permissions,
subject to role hierarchy and policy.

Do not allow an accidental role to bypass restrictions.

============================================================
86. DEVICE ROLE RELATIONSHIP
============================================================

Device:

- device_id
- name
- branch
- workspace_type
- station_id
- active
- last_seen

Examples:

POS-01
→ Cashier

KITCHEN-PIZZA-01
→ Chef / Pizza

PACKING-01
→ Packing

============================================================
87. WORKSPACE STARTUP
============================================================

After login:

1. Authenticate.
2. Load user.
3. Load active roles.
4. Load branch.
5. Load permissions.
6. Load workspace.
7. Load language.
8. Load feature flags.
9. Load device context.
10. Redirect.
11. Load only required API data.

Do NOT load the entire restaurant dataset.

============================================================
88. DATA MINIMIZATION
============================================================

Every workspace should request only necessary data.

Chef:
Kitchen tickets only.

Driver:
Assigned deliveries.

Cashier:
POS/catalog/current shift.

Manager:
Branch operational data.

This improves security and performance.

============================================================
89. PERFORMANCE
============================================================

Role-specific dashboards must use specialized APIs.

Do not load:

all orders
all customers
all employees
all inventory

at login.

Use:

- pagination
- lazy loading
- server-side filtering
- role-specific endpoints
- cached configuration

============================================================
90. PRINTING PERMISSIONS
============================================================

Chef:
Can print kitchen ticket if permitted.

Cashier:
Customer receipt.

Packing:
Packing ticket.

Manager:
All permitted documents.

Only authorized users can reprint.

============================================================
91. INVENTORY PERMISSIONS
============================================================

Chef:

inventory.availability.view

Inventory:

inventory.view
inventory.receive
inventory.adjust
inventory.transfer
inventory.count

Manager:

all branch inventory permissions.

============================================================
92. CUSTOMER PERMISSIONS
============================================================

Cashier:

customer.search
customer.create
customer.edit

Captain:

customer.view_limited

Driver:

customer.view_assigned_delivery

Manager:

customer.full

============================================================
93. FINANCIAL PERMISSIONS
============================================================

cashier.payment
cashier.refund_request

manager.refund_approve

accounting.financial_view

owner.financial_all

============================================================
94. SETTINGS CATEGORIES
============================================================

GLOBAL_SETTINGS:
Owner

BRANCH_SETTINGS:
Owner / Manager

OPERATIONAL_SETTINGS:
Manager

KITCHEN_SETTINGS:
Manager / Kitchen Supervisor

PRINTER_SETTINGS:
Manager / Admin

USER_SETTINGS:
Manager / Owner

SECURITY_SETTINGS:
Owner / Security Admin

============================================================
95. ROLE-SPECIFIC LOGOUT
============================================================

Logout must:

- invalidate session
- clear client state
- clear cached sensitive data
- clear workspace context
- redirect to login

============================================================
96. ROLE-SPECIFIC ERROR HANDLING
============================================================

Error messages must use current language.

Example:

English:
"You do not have permission to refund this order."

Arabic:
"ليس لديك صلاحية لرد مبلغ هذا الطلب."

============================================================
97. MULTILINGUAL ROLE WORKSPACES
============================================================

All roles support:

English
Arabic

The workspace layout changes appropriately for RTL.

Physical information such as:

Table coordinates
Printer locations
Kitchen station coordinates

must NOT be mirrored just because the UI is Arabic.

============================================================
98. MOBILE ROLE WORKSPACES
============================================================

Captain:
Mobile-first

Driver:
Mobile-first

Chef:
Tablet-first

Cashier:
Desktop-first

Manager:
Desktop + mobile

Owner:
Mobile + desktop

============================================================
99. ROLE-SPECIFIC SHORTCUTS
============================================================

Cashier:

F2 = New Order
F4 = Search Customer
F8 = Payment

Captain:

N = New Order

Chef:

Space = Start/Ready
R = Recall

Shortcuts must be configurable.

============================================================
100. OFFLINE/NETWORK
============================================================

When disconnected:

Clearly display:

OFFLINE

Do not pretend server synchronization succeeded.

Workspace may cache safe operational data.

Critical backend actions require server confirmation unless
explicit offline architecture exists.

============================================================
101. TESTING
============================================================

Create tests for:

Role login
Role redirect
Permission checking
Branch access
Workspace loading
Unauthorized route
Unauthorized API
Customer visibility
Financial visibility
Settings visibility
Printer permissions
Kitchen permissions
Driver permissions
Role switching
Session timeout
PIN login
Manager override
Audit logging
Language persistence

============================================================
102. SECURITY TEST CASES
============================================================

Test:

Cashier calling manager API
Chef calling customer API
Driver accessing another driver
Captain accessing another branch
User changing role from frontend
User changing branch ID
User changing price in API
User refunding through direct API request

All unauthorized attempts must fail.

============================================================
103. E2E SCENARIO — CASHIER
============================================================

Cashier logs in.

System redirects:

/cashier

Cashier sees:

POS
Orders
Customers
Shift

Cashier does not see:

Inventory
Settings
Users
Reports

Cashier creates order.

Order is accepted.

Cashier prints receipt.

============================================================
104. E2E SCENARIO — CAPTAIN
============================================================

Captain logs in.

System redirects:

/captain

Captain sees assigned tables.

Captain opens Table 12.

Captain creates order.

Kitchen receives order.

Captain receives ready notification.

Captain requests bill.

Captain cannot open inventory.

============================================================
105. E2E SCENARIO — CHEF
============================================================

Chef logs in.

System redirects:

/chef

Chef sees only assigned station.

Chef receives Pizza ticket.

Chef starts ticket.

Chef completes ticket.

Chef does not see customer financial information.

Chef does not see manager reports.

============================================================
106. E2E SCENARIO — DRIVER
============================================================

Driver logs in.

System redirects:

/driver

Driver sees assigned delivery.

Driver sees:

Customer name
Phone
Address
Delivery note
Amount to collect

Driver cannot see:

Other deliveries
Kitchen settings
Inventory
Reports

Driver marks delivered.

============================================================
107. E2E SCENARIO — MANAGER
============================================================

Manager logs in.

System redirects:

/manager

Manager sees:

Dashboard
Orders
Tables
Kitchen
Inventory
Delivery
Staff
Reports
Settings

Manager can approve authorized actions.

============================================================
108. E2E SCENARIO — OWNER
============================================================

Owner logs in.

System redirects:

/owner

Owner sees:

Organization
Branches
Brands
Financial
Analytics
Security
Audit
Settings

Owner can access operational areas when needed.

============================================================
109. ROLE SEPARATION UX
============================================================

The UI must make it obvious:

"I am logged in as Chef."

"I am in Pizza Station."

"I am logged in as Cashier."

"I am in Branch A."

Display:

User Name
Role
Branch
Workspace
Language

============================================================
110. NO CROSS-ROLE UI
============================================================

Do not show disabled menu items everywhere.

Preferred behavior:

If the user cannot use it,
do not show it.

Exception:

Manager permission preview may show denied capabilities.

============================================================
111. SECURITY OVER CONVENIENCE
============================================================

Never expose sensitive data simply because it is technically convenient.

Use minimum required access.

============================================================
112. FINAL ARCHITECTURE
============================================================

Architecture:

AUTHENTICATION
      ↓
IDENTITY
      ↓
ROLE
      ↓
PERMISSIONS
      ↓
BRANCH SCOPE
      ↓
RESOURCE SCOPE
      ↓
WORKSPACE
      ↓
ROLE-SPECIFIC UI
      ↓
ROLE-SPECIFIC API DATA

============================================================
113. FINAL ACCEPTANCE CRITERIA
============================================================

The system is accepted only if:

- Every role has an isolated workspace.
- Every role has its own login experience.
- Users are redirected automatically after login.
- Users cannot see unauthorized navigation.
- Users cannot access unauthorized routes.
- Users cannot call unauthorized APIs.
- Users only receive necessary data.
- Branch restrictions are enforced.
- Resource-level permissions are enforced.
- Settings are isolated by permission.
- Reports are isolated by permission.
- Customer data is role scoped.
- Financial information is role scoped.
- Kitchen sees only kitchen information.
- Driver sees only assigned delivery information.
- Cashier sees only POS-related functionality.
- Captain sees only tables/orders/service functionality.
- Manager has operational management access.
- Owner has organization-level access.
- Custom roles are supported.
- Temporary delegation is supported.
- Manager approval workflow works.
- Session timeout works.
- PIN locking works.
- Audit logs work.
- Arabic and English work independently per user.
- Mobile-specific workspaces work.
- Role-specific real-time notifications work.
- Unauthorized access returns 401/403 correctly.
- Direct URL/API attempts cannot bypass security.

============================================================
114. FINAL ENGINEERING RULE
============================================================

DO NOT implement role separation as:

"Hide some buttons in React."

Implement it as a real security architecture.

Every request must be authorized by the backend.

Every workspace must be purpose-built.

Every role must receive minimum necessary access.

Every sensitive operation must be logged.

Every branch must be isolated.

Every session must have explicit identity and scope.

The employee should open the application and immediately see
ONLY what they need to perform their job.

END OF SPECIFICATION
`;

module.exports = restaurantOSRoleBasedOperationsPrompt;
                    RestaurantOS
                         |
                    LOGIN SYSTEM
                         |
        +----------------+----------------+
        |                |                |
     MANAGER           CASHIER          CAPTAIN
        |                |                |
   Manager UI         POS UI          Tables UI
        |
        +----------------+
        |
     CHEF
        |
   Kitchen UI
        |
        +------ Pizza
        +------ Sandwich
        +------ Grill
        +------ Bar

     DRIVER
        |
   Delivery UI

    PACKING
        |
   Packing UI

   INVENTORY
        |
   Inventory UI

   ACCOUNTING
        |
   Finance UI