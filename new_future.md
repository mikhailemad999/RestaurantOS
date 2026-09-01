```javascript
const restaurantOSAdvancedPrompt = `
You are a SENIOR SOFTWARE ARCHITECT, SENIOR FULL-STACK ENGINEER,
DATABASE ARCHITECT, DEVOPS ENGINEER, PRODUCT MANAGER, DATA ENGINEER,
BI ENGINEER, SECURITY ENGINEER, QA ENGINEER, UX/UI DESIGNER,
RESTAURANT OPERATIONS CONSULTANT and AI SOLUTIONS ARCHITECT.

You are extending an existing production-oriented restaurant management
platform called RestaurantOS.

============================================================
IMPORTANT: EXISTING SYSTEM
============================================================

The existing RestaurantOS project already contains the following major
modules and must NOT be unnecessarily rebuilt from scratch:

1. POS Terminal
2. Kitchen Display System (KDS)
3. Floor Plan & Tables
4. Menu & Recipe Costing
5. Stock & Inventory Control
6. Delivery Dispatch Board
7. Driver Logistics Mobile App
8. Customer Loyalty CRM
9. Self-Order Customer Kiosk
10. Executive BI Dashboard
11. Financial Reports
12. Manager Mobile Companion
13. Waiter Handheld POS
14. Staff & RBAC
15. Global Settings
16. PIN Login

The existing project documentation describes:
- Django REST Framework backend
- MySQL 8.x database
- React frontend
- Tailwind CSS
- Layered backend architecture
- POS order processing
- Kitchen stations
- table management
- inventory recipe/BOM deduction
- delivery management
- customer loyalty
- BI dashboards
- financial reports
- staff permissions
- automated tests

DO NOT destroy or replace working functionality.

Instead, extend the existing architecture in a modular and backward-compatible
way.

The current source project must be treated as the FOUNDATION.

============================================================
PRIMARY OBJECTIVE
============================================================

Transform RestaurantOS from a traditional restaurant POS and management
system into a complete:

RESTAURANT OPERATING SYSTEM + BUSINESS INTELLIGENCE PLATFORM
+ CUSTOMER GROWTH PLATFORM + OPERATIONS OPTIMIZATION PLATFORM.

The new system must help restaurant owners and managers:

- Increase revenue
- Increase customer retention
- Increase average order value
- Increase table utilization
- Reduce food cost
- Reduce waste
- Reduce stockouts
- Reduce employee mistakes
- Reduce fraud
- Improve kitchen speed
- Improve delivery efficiency
- Improve customer satisfaction
- Improve profitability
- Compare branches
- Make faster management decisions
- Automatically identify problems
- Automatically recommend actions

Every new feature must have a measurable business purpose.

============================================================
1. BUSINESS INTELLIGENCE ENGINE
============================================================

Create a new module:

/business-intelligence

Build a real BI engine that combines data from:

- Orders
- Order items
- Payments
- Tables
- Customers
- Inventory
- Recipes
- Purchases
- Expenses
- Staff
- Delivery
- Kitchen
- Promotions
- Loyalty
- Reservations
- Branches

Create these analytics:

------------------------------------------------------------
Revenue Analytics
------------------------------------------------------------

Calculate:

- Gross Revenue
- Net Revenue
- Revenue after discounts
- Revenue after refunds
- Revenue by day
- Revenue by hour
- Revenue by week
- Revenue by month
- Revenue by year
- Revenue by branch
- Revenue by category
- Revenue by item
- Revenue by order type
- Revenue by payment method

------------------------------------------------------------
Profitability Analytics
------------------------------------------------------------

Calculate:

- Gross Profit
- Estimated Net Profit
- Gross Margin
- Net Margin
- Food Cost %
- Beverage Cost %
- Labor Cost %
- Total Operating Cost
- Contribution Margin
- Profit per item
- Profit per order
- Profit per table
- Profit per customer

Do NOT use floating point arithmetic for monetary calculations.

Use Decimal / database decimal fields.

------------------------------------------------------------
Performance KPIs
------------------------------------------------------------

Calculate:

- Average Order Value
- Orders per hour
- Revenue per hour
- Revenue per table
- Table turnover
- Table occupancy %
- Average dining duration
- Kitchen preparation time
- Delivery preparation time
- Delivery duration
- Cancellation rate
- Refund rate
- Discount rate
- Customer retention rate
- Repeat customer rate

============================================================
2. RESTAURANT HEALTH SCORE
============================================================

Create:

/business-health

Build a Restaurant Health Score from 0-100.

Components:

- Sales performance
- Profitability
- Food cost
- Inventory health
- Waste
- Kitchen performance
- Customer satisfaction
- Customer retention
- Staff performance
- Table utilization
- Delivery performance

Example:

Restaurant Health Score: 87/100

Show:

- Score
- Trend
- Previous period
- Current period
- Main positive factors
- Main negative factors
- Recommended actions

Example:

"Food cost increased by 4.2% this week."

"Kitchen delay increased by 12%."

"Customer retention improved by 7%."

============================================================
3. MENU ENGINEERING
============================================================

Create:

/menu-engineering

Classify menu items into:

1. STAR
   High sales + High profit

2. PLOW HORSE
   High sales + Low profit

3. PUZZLE
   Low sales + High profit

4. DOG
   Low sales + Low profit

Calculate:

- Units sold
- Revenue
- Ingredient cost
- Gross profit
- Margin %
- Popularity %
- Contribution margin
- Category rank

For every product provide recommendations:

- Increase price
- Decrease ingredient cost
- Promote
- Move higher in menu
- Bundle
- Replace
- Remove
- Keep

Example recommendation:

"Chicken Ranch Pizza is highly popular but has only 8.4% margin.
Review ingredient cost or increase selling price."

Create product profitability charts.

============================================================
4. SMART PRICING
============================================================

Create:

/pricing-intelligence

Track:

- Historical selling price
- Ingredient price
- Supplier price
- Profit margin
- Sales volume
- Discounts

Detect:

- Margin reduction
- Ingredient inflation
- Underpriced items
- Overpriced items

Provide manager recommendations:

Example:

"Cheese price increased 16% during the last 30 days."

"Pizza Ranch margin dropped from 31% to 24%."

"Suggested new selling price: X."

Never automatically change production prices unless the manager explicitly
approves the change.

All price changes require:

- User
- old price
- new price
- reason
- timestamp
- approval

============================================================
5. SMART INVENTORY FORECASTING
============================================================

Extend the current inventory module.

Create:

/inventory-intelligence

Forecast:

- Tomorrow consumption
- 7-day consumption
- 30-day consumption
- Weekend demand
- Seasonal demand
- Peak-hour demand

For each ingredient calculate:

- Current stock
- Average daily consumption
- Forecast consumption
- Safety stock
- Reorder point
- Supplier lead time
- Suggested order quantity
- Stockout probability

Example:

Chicken:

Current stock: 17 KG
Daily average: 9 KG
Forecast Friday: 15 KG
Safety stock: 10 KG
Recommended purchase: 25 KG

Create:

- Low stock alerts
- Critical stock alerts
- Stockout prediction
- Excess inventory alerts
- Slow-moving inventory alerts
- Expiry alerts

============================================================
6. AUTOMATIC PURCHASE RECOMMENDATIONS
============================================================

Create:

/purchase-intelligence

System generates:

Suggested Purchase Orders.

Inputs:

- Current inventory
- Consumption forecast
- Safety stock
- Supplier lead time
- Supplier minimum order
- Historical demand
- Existing purchase orders

Output:

Supplier
Ingredient
Recommended quantity
Expected price
Expected delivery date
Reason

Manager can:

- Approve
- Modify
- Reject
- Convert to purchase order

Never automatically submit purchase orders to suppliers without approval.

============================================================
7. SUPPLIER INTELLIGENCE
============================================================

Create:

/suppliers/analytics

Track every supplier:

- Price
- Delivery time
- Late deliveries
- Quality issues
- Rejected shipments
- Price changes
- Payment terms
- Total purchase amount
- Average price

Generate supplier score 0-100.

Example:

Supplier A = 91
Supplier B = 78
Supplier C = 66

Comparison:

Ingredient
Supplier
Price
Quality score
Delivery score
Overall score

============================================================
8. WASTE INTELLIGENCE
============================================================

Current system supports waste logging.

Extend it to analyze:

- Waste quantity
- Waste cost
- Waste percentage
- Waste by ingredient
- Waste by kitchen station
- Waste by employee
- Waste by shift
- Waste by branch
- Waste reason

Reasons:

- Expired
- Burned
- Overproduction
- Preparation error
- Wrong order
- Customer return
- Damaged
- Storage problem

Detect abnormal waste.

Example:

"Chicken waste increased 31% compared to previous week."

Calculate:

Daily waste cost
Weekly waste cost
Monthly waste cost
Annualized waste cost

============================================================
9. KITCHEN PERFORMANCE INTELLIGENCE
============================================================

Extend KDS.

Create:

/kitchen/analytics

Measure:

- Average ticket time
- Average item preparation time
- Time by station
- Time by product
- Delayed tickets
- Peak workload
- Orders per chef/station
- Repeated remakes
- Kitchen bottlenecks

Identify:

Slowest station
Fastest station
Most delayed item
Peak kitchen hour

Example:

"Grill station caused 61% of delayed tickets."

============================================================
10. ORDER ACCURACY SYSTEM
============================================================

Create:

/quality-control

Track:

- Wrong item
- Missing item
- Wrong modifier
- Wrong quantity
- Late order
- Customer complaint
- Kitchen remake
- Delivery mistake
- Cashier mistake
- Captain mistake

Calculate:

Order Accuracy %

Remake %

Complaint %

Create employee and station quality trends.

============================================================
11. CUSTOMER INTELLIGENCE / ADVANCED CRM
============================================================

Extend existing CRM.

Create:

/customer-intelligence

Track:

- Customer lifetime value
- Average order value
- Order frequency
- Last order date
- Favorite category
- Favorite item
- Favorite branch
- Preferred order type
- Preferred ordering time
- Total spending
- Number of visits
- Loyalty points

Customer segments:

- New
- Regular
- VIP
- High Value
- At Risk
- Lost
- Returning
- Delivery-focused
- Dine-in-focused

============================================================
12. CUSTOMER CHURN DETECTION
============================================================

Detect customers becoming inactive.

Example:

Ahmed historically orders every 10 days.

Last order was 37 days ago.

Status:

AT RISK

Generate recommendation:

"Send 15% win-back offer."

Do not automatically contact customers without configured campaign
approval.

============================================================
13. CUSTOMER LIFETIME VALUE
============================================================

Calculate:

- Current lifetime value
- Predicted lifetime value
- Average order value
- Average monthly spend
- Retention duration
- Order frequency

Show top customers by profitability, not only revenue.

============================================================
14. MARKETING CAMPAIGN SYSTEM
============================================================

Create:

/marketing

Build Campaign Builder.

Campaign types:

- Welcome campaign
- Birthday campaign
- Win-back
- VIP campaign
- New product
- Flash sale
- Happy hour
- Weekend campaign
- Lunch campaign
- Loyalty reward
- Abandoned cart
- Branch-specific promotion

Target filters:

- Customer segment
- Spending
- Last order
- Favorite item
- Favorite category
- Branch
- Age range if available and legally appropriate
- Order type

Channels:

- In-app
- Push
- Email
- SMS
- WhatsApp through a configurable integration

Track:

- Sent
- Delivered
- Opened
- Clicked
- Redeemed
- Revenue generated
- Campaign cost
- ROI

============================================================
15. PROMOTION ROI
============================================================

For every promotion calculate:

- Discount cost
- Number of users
- Orders generated
- Revenue generated
- Gross profit generated
- Incremental revenue
- ROI

Show:

"Promotion generated $8,400 revenue but reduced gross profit by $1,200."

Avoid evaluating promotions on revenue alone.

============================================================
16. QR TABLE ORDERING
============================================================

Create:

/qr-ordering

Every table receives a unique QR code.

Workflow:

Customer scans QR
→ Table identified
→ Restaurant menu opens
→ Customer selects products
→ Customer customizes items
→ Customer confirms
→ Order enters POS/KDS
→ Captain receives notification
→ Kitchen prepares order

Security requirements:

- Signed table token
- Prevent table spoofing
- Expiring session token
- Rate limiting
- Customer cannot modify another table's order

Allow:

- Order again
- Request waiter
- Request bill
- Call staff
- Leave feedback

============================================================
17. ONLINE ORDERING
============================================================

Create a public customer ordering website.

Pages:

- Home
- Menu
- Categories
- Item details
- Cart
- Checkout
- Delivery address
- Pickup
- Order tracking
- Customer profile
- Loyalty
- Promotions

Order statuses:

- Received
- Confirmed
- Preparing
- Ready
- Out for delivery
- Delivered
- Cancelled

Connect directly to RestaurantOS APIs.

============================================================
18. WAITLIST MANAGEMENT
============================================================

Create:

/waitlist

Features:

- Add guest
- Guest count
- Phone
- Estimated wait
- Preferred area
- Preferred table size
- Queue position
- Check-in
- Seating
- No-show

Automatically calculate estimated waiting time from:

- Current occupied tables
- Historical table turnover
- Current kitchen capacity
- Reservation schedule

============================================================
19. RESERVATION INTELLIGENCE
============================================================

Extend reservation module.

Calculate:

- Reservation count
- No-show rate
- Average party size
- Revenue by reservation
- Table utilization
- Peak reservation time

Add:

- Reservation deposit
- Confirmation
- Cancellation
- No-show tracking
- Waitlist integration

============================================================
20. STAFF PERFORMANCE
============================================================

Create:

/staff-performance

Calculate:

- Orders handled
- Sales handled
- Average service time
- Table turnover
- Discount usage
- Cancellation rate
- Cash variance
- Customer feedback
- Attendance
- Shift adherence
- Tips
- Commission

Create staff score.

Do NOT create misleading rankings using raw sales only.

Use configurable weighted KPIs.

============================================================
21. STAFF ATTENDANCE & SHIFT MANAGEMENT
============================================================

Create:

/staff/scheduling

Features:

- Clock in
- Clock out
- Break
- Late arrival
- Early leave
- Overtime
- Shift scheduling
- Shift swap
- Shift approval
- Attendance report

Create:

Schedule vs Actual

============================================================
22. ADVANCED CASH CONTROL
============================================================

Extend CashShift.

Add:

- Cash in
- Cash out
- Expense
- Refund
- Expected cash
- Actual cash
- Variance
- Manager approval

Fraud detection rules:

- Unusual refunds
- Excessive discounts
- Multiple voids
- Repeated reprints
- Cash variance
- Orders cancelled after kitchen preparation
- Suspicious activity outside normal working hours

Generate risk alerts.

============================================================
23. APPROVAL WORKFLOW
============================================================

Create:

/approvals

Configurable approvals for:

- Refund
- Large discount
- Price change
- Cash adjustment
- Inventory adjustment
- Order cancellation
- Purchase order
- Expense
- Staff permission change

Example:

Cashier requests refund
→ Manager receives approval
→ Manager approves via PIN/password
→ Refund executes
→ Audit record generated

============================================================
24. FRAUD & ANOMALY DETECTION
============================================================

Create:

/risk-center

Detect unusual:

- Refund frequency
- Discount frequency
- Void frequency
- Price changes
- Cash drawer variance
- Inventory adjustments
- Waste spikes
- Login behavior
- Order cancellation behavior

Use rules first.

Optional machine-learning anomaly detection may be added later.

Every alert must show:

- Why triggered
- Related user
- Related order
- Severity
- Recommended action
- Resolution status

============================================================
25. CUSTOMER FEEDBACK
============================================================

Create:

/feedback

Allow customers to rate:

- Food
- Service
- Speed
- Cleanliness
- Delivery

Rating:

1-5

Allow written comments.

Create manager workflow:

New
→ Reviewing
→ Responded
→ Resolved

Connect feedback with:

- Order
- Table
- Captain
- Branch
- Delivery driver

============================================================
26. DAILY MANAGEMENT BRIEF
============================================================

Create:

/daily-brief

Generate a management summary.

Example:

YESTERDAY

Revenue: +12%
Orders: +8%
Average Ticket: +4%
Food Cost: -2%
Waste: +5%
Customer Retention: +7%

BEST PRODUCT:
Chicken Ranch Pizza

BIGGEST PROBLEM:
Cheese cost increased 14%.

KITCHEN:
Average ticket time increased 9%.

RECOMMENDED ACTION:
Review supplier pricing.

TODAY FORECAST:
Revenue: X
Orders: X
Expected peak hour: X

All recommendations must explain their data source.

============================================================
27. OWNER MOBILE DASHBOARD
============================================================

Create:

/owner-mobile

Large mobile-friendly KPI interface.

Show:

- Sales
- Profit estimate
- Orders
- Food cost
- Waste
- Customers
- Open tables
- Kitchen delay
- Delivery queue
- Cash variance
- Critical alerts

Push alerts:

- Food cost exceeded threshold
- Sales target achieved
- Inventory critical
- Excess waste
- Cash variance
- Suspicious refund
- Kitchen delays

============================================================
28. MULTI-BRANCH INTELLIGENCE
============================================================

Extend branch system.

Central headquarters must be able to compare branches.

Metrics:

- Revenue
- Profit
- Food cost
- Labor cost
- Waste
- Customer retention
- Orders
- Average ticket
- Table utilization
- Delivery performance
- Staff performance

Create:

Branch Ranking

But rankings must be configurable and should not encourage
unsafe or misleading competition.

============================================================
29. CENTRALIZED MENU WITH BRANCH OVERRIDES
============================================================

Create centralized menu:

Global Menu
|
|-- Branch A
|-- Branch B
|-- Branch C

Allow branch overrides for:

- Price
- Availability
- Recipe
- Category visibility
- Promotion
- Inventory mapping

============================================================
30. MULTI-BRANCH INVENTORY TRANSFERS
============================================================

Add:

Branch A
↓
Transfer Request
↓
Branch B Approval
↓
Dispatch
↓
Receive
↓
Inventory Ledger Updated

Every movement must be auditable.

============================================================
31. EXPENSE INTELLIGENCE
============================================================

Create:

/expenses/analytics

Track:

- Rent
- Utilities
- Salaries
- Marketing
- Maintenance
- Transportation
- Software
- Supplies
- Other expenses

Calculate:

- Expense trend
- Expense % of revenue
- Expense per branch
- Expense category breakdown
- Unexpected expense alerts

============================================================
32. TARGETS & GOALS
============================================================

Create:

/targets

Manager can configure:

- Daily sales target
- Monthly sales target
- Profit target
- Food cost target
- Waste target
- Customer retention target
- Order target
- Average ticket target

Show:

Target
Actual
Variance
Achievement %

============================================================
33. SALES FORECASTING
============================================================

Create:

/forecasting

Forecast:

- Revenue
- Orders
- Customers
- Inventory demand

Inputs:

- Historical sales
- Day of week
- Seasonality
- Promotions
- Holidays
- Weather integration if explicitly configured
- Branch trends

Start with statistical forecasting.

AI/ML forecasting may be added as a separate service later.

============================================================
34. DEMAND PLANNING
============================================================

Forecast demand per item.

Example:

Friday:

Chicken Pizza
Expected units = 184

Burger
Expected units = 126

Fries
Expected units = 241

Use this for:

- Kitchen preparation planning
- Inventory purchasing
- Staff planning

Do not automatically overproduce food.

============================================================
35. AI MANAGEMENT ASSISTANT
============================================================

Create optional:

/ai-manager

The AI assistant can answer questions such as:

"What were sales yesterday?"

"Why did food cost increase?"

"Which products are most profitable?"

"Which products should I promote?"

"Which ingredients may run out?"

"Which branch is performing best?"

"Why are kitchen orders delayed?"

"Which customers are at risk?"

"Which promotion performed best?"

Important:

The AI must use structured internal business data.

Do not allow unrestricted database access.

Use explicit backend tools/functions.

The AI must cite the source metrics it used internally.

For sensitive actions:

AI can recommend.

AI must NOT execute:

- refunds
- money transfers
- permission changes
- price changes
- purchase orders
- destructive operations

without explicit human confirmation.

============================================================
36. SMART RECOMMENDATIONS ENGINE
============================================================

Create:

/recommendations

Generate recommendations such as:

1. Pricing recommendation
2. Inventory recommendation
3. Menu recommendation
4. Marketing recommendation
5. Staffing recommendation
6. Waste reduction recommendation
7. Supplier recommendation
8. Table optimization recommendation
9. Delivery optimization recommendation

Every recommendation must include:

- Recommendation
- Confidence
- Reason
- Supporting metrics
- Expected impact
- Risk
- Approval requirement

============================================================
37. RESTAURANT COMMAND CENTER
============================================================

Create:

/command-center

This is the main manager page.

Display:

------------------------------------------------
REVENUE
------------------------------------------------
Today
Yesterday
This Week
This Month

------------------------------------------------
OPERATIONS
------------------------------------------------
Open Tables
Kitchen Queue
Delayed Orders
Delivery Queue
Reservations

------------------------------------------------
PROFITABILITY
------------------------------------------------
Food Cost
Waste
Gross Margin
Estimated Profit

------------------------------------------------
CUSTOMERS
------------------------------------------------
New Customers
Returning Customers
VIP Customers
At Risk

------------------------------------------------
ALERTS
------------------------------------------------
Critical inventory
Cash variance
Kitchen delay
Fraud risk
Customer complaint

------------------------------------------------
RECOMMENDATIONS
------------------------------------------------
Top 5 actions the manager should take.
============================================================

============================================================
38. BUSINESS ALERT ENGINE
============================================================

Create configurable alert rules.

Examples:

IF food_cost > configured_threshold
THEN create alert.

IF stock < reorder_point
THEN create alert.

IF waste > historical_average + threshold
THEN create alert.

IF refund_count > threshold
THEN create alert.

IF kitchen_time > SLA
THEN create alert.

IF customer_rating < threshold
THEN create alert.

Each alert has:

- type
- severity
- entity
- branch
- generated_at
- acknowledged_by
- resolved_by
- status

============================================================
39. DATA WAREHOUSE / ANALYTICS LAYER
============================================================

For large deployments, introduce an analytics layer.

Do NOT slow down transactional POS queries with heavy analytics.

Create optimized analytics tables/materialized views for:

- Daily sales
- Hourly sales
- Product sales
- Product profitability
- Customer metrics
- Inventory consumption
- Kitchen metrics
- Delivery metrics
- Staff metrics

Use scheduled aggregation jobs.

============================================================
40. BACKGROUND JOBS
============================================================

Use Celery/background workers for:

- Forecast calculations
- Daily reports
- Scheduled campaigns
- Low stock alerts
- Customer segmentation
- Data aggregation
- Report generation
- Email notifications
- Export generation
- Loyalty processing
- Reservation reminders

Never execute expensive analytics synchronously inside the POS request.

============================================================
41. EVENT-DRIVEN ARCHITECTURE
============================================================

Introduce domain events where useful.

Events:

OrderCreated
OrderPaid
OrderCancelled
OrderRefunded
KitchenTicketCreated
KitchenTicketReady
TableOccupied
TableReleased
InventoryLow
InventoryAdjusted
CustomerOrderCompleted
PromotionRedeemed
ShiftOpened
ShiftClosed
CashVarianceDetected
WasteRecorded
ReservationCreated

Consumers may update:

- Analytics
- Notifications
- Loyalty
- Inventory
- Customer metrics
- Alerts

============================================================
42. DATABASE EXTENSIONS
============================================================

Add appropriate models/entities such as:

BusinessMetric
DailySalesSnapshot
ProductPerformanceSnapshot
ProfitabilitySnapshot
CustomerMetric
CustomerSegment
CustomerEvent
MarketingCampaign
CampaignAudience
CampaignMessage
CampaignConversion
PromotionRedemption
Forecast
ForecastItem
InventoryForecast
PurchaseRecommendation
SupplierPerformance
WasteAnalysis
KitchenPerformanceSnapshot
StaffPerformanceSnapshot
RestaurantHealthScore
BusinessAlert
BusinessRecommendation
ApprovalRequest
ApprovalAction
RiskAlert
CustomerFeedback
ReservationWaitlist
QRCodeTableSession
OnlineOrder
PriceChange
PriceApproval
BranchMetric
ExpenseCategory
Target
TargetProgress
DomainEvent

Use normalized transactional tables and optimized analytical structures
where appropriate.

============================================================
43. API EXTENSIONS
============================================================

Add APIs:

/api/business-intelligence/
/api/business-health/
/api/menu-engineering/
/api/pricing-intelligence/
/api/inventory-intelligence/
/api/purchase-intelligence/
/api/supplier-analytics/
/api/waste-analytics/
/api/kitchen-analytics/
/api/quality-control/
/api/customer-intelligence/
/api/customer-segments/
/api/marketing/
/api/campaigns/
/api/qr-ordering/
/api/online-ordering/
/api/waitlist/
/api/reservation-intelligence/
/api/staff-performance/
/api/staff-scheduling/
/api/risk-center/
/api/approvals/
/api/feedback/
/api/daily-brief/
/api/owner-mobile/
/api/branch-intelligence/
/api/expense-analytics/
/api/targets/
/api/forecasting/
/api/demand-planning/
/api/ai-manager/
/api/recommendations/
/api/command-center/
/api/alerts/

============================================================
44. PERMISSION MODEL
============================================================

Add permissions such as:

bi.view
bi.export

profit.view
profit.export

menu_engineering.view
pricing.view
pricing.request_change
pricing.approve_change

inventory_forecast.view
purchase_recommendation.view
purchase_recommendation.approve

supplier.analytics.view

waste.analytics.view

kitchen.analytics.view

customer_intelligence.view

marketing.view
marketing.create
marketing.approve
marketing.send

qr_ordering.manage

online_ordering.manage

waitlist.manage

staff_performance.view
staff_schedule.manage

risk.view
risk.resolve

approval.view
approval.approve

feedback.view
feedback.respond

forecast.view

ai_manager.use

recommendation.view
recommendation.approve

branch_analytics.view

Owner:
FULL ACCESS

Manager:
Operational + Analytics access according to configured permissions.

Cashier:
POS + customer + assigned operational functions.

Captain:
Tables + orders + assigned customers.

Kitchen:
KDS + kitchen operational data only.

Driver:
Assigned delivery only.

Never rely solely on frontend permission hiding.
Every protected endpoint must validate permissions server-side.

============================================================
45. AUDIT SYSTEM
============================================================

Every sensitive action creates immutable audit data.

Track:

- user
- role
- action
- entity
- entity_id
- old_value
- new_value
- reason
- timestamp
- IP
- device
- branch

Sensitive events:

- Refund
- Discount
- Price change
- Inventory adjustment
- Cash adjustment
- Permission change
- Purchase approval
- Promotion approval
- Data export
- Login anomaly

============================================================
46. REPORT EXPORTS
============================================================

Allow:

- PDF
- Excel
- CSV

Reports:

- Profitability
- Food cost
- Waste
- Inventory
- Customer
- Marketing
- Staff
- Kitchen
- Delivery
- Branch
- Expenses
- Daily closing
- Executive summary

Large reports must use background jobs.

============================================================
47. DASHBOARD DESIGN
============================================================

Keep the existing dark premium restaurant design language.

Use:

- Dark professional UI
- High contrast
- Premium restaurant visual identity
- Clear KPI cards
- Charts
- Trend indicators
- Status badges
- Warning states
- Critical alerts
- Responsive layout

Do not overload dashboards.

Prioritize:

1. What happened?
2. Why?
3. Is it good or bad?
4. What should the manager do?

============================================================
48. UX RULE
============================================================

A restaurant employee may be working under pressure.

Therefore:

- Reduce clicks
- Reduce typing
- Use search
- Use shortcuts
- Use touch-friendly controls
- Use contextual actions
- Avoid unnecessary confirmation dialogs
- Confirm only destructive/sensitive operations

POS must remain extremely fast.

Analytics pages may be information-dense.

============================================================
49. SECURITY
============================================================

Implement:

- Authentication
- Authorization
- RBAC
- Object-level permission checks
- Rate limiting
- Input validation
- Secure password storage
- Secure PIN handling
- Audit logging
- CSRF protection where applicable
- XSS protection
- SQL injection protection
- Secure uploads
- Token rotation
- Session/device management
- Permission validation on backend

Never expose:

- database credentials
- secret keys
- JWT secrets
- API secrets

Never hardcode production credentials.

============================================================
50. PRIVACY
============================================================

Customer data must be handled carefully.

Support:

- data minimization
- access control
- audit trail
- customer data export
- customer data deletion where legally permitted
- marketing consent
- unsubscribe
- communication preferences

Do not collect sensitive personal data unless necessary.

============================================================
51. TESTING
============================================================

Create automated tests for all new modules.

Minimum tests:

Business intelligence
Profit calculations
Food cost
Menu engineering
Inventory forecast
Purchase recommendation
Supplier scoring
Waste analytics
Customer segmentation
Customer churn
Campaign ROI
QR ordering
Online ordering
Waitlist
Staff performance
Fraud rules
Approval workflow
Feedback
Branch analytics
Targets
Forecasting
Alerts
Recommendations
AI tool permissions

Create:

- Unit tests
- Integration tests
- API tests
- Permission tests
- E2E tests

Critical transactional functions must use database transactions.

============================================================
52. PERFORMANCE
============================================================

The POS must remain fast even when analytics data becomes large.

Requirements:

- Database indexes
- Pagination
- Query optimization
- Avoid N+1 queries
- Redis caching where appropriate
- Background aggregation
- Async exports
- WebSocket updates
- Lazy loading
- Optimized dashboard endpoints
- Database connection pooling
- Read optimization for analytics

Never run expensive BI calculations on every POS request.

============================================================
53. OBSERVABILITY
============================================================

Add:

- Structured application logs
- Error tracking
- API latency tracking
- Background job monitoring
- Database performance monitoring
- Health checks
- Service status
- Failed job alerts

Create:

/system-health

Show:

API
Database
Redis
Celery
WebSocket
Storage
External integrations

============================================================
54. BACKUP & DISASTER RECOVERY
============================================================

Support:

- Automated database backups
- Backup retention
- Backup verification
- Restore procedure
- Media backup
- Configuration backup

Document:

- Backup strategy
- Restore procedure
- Disaster recovery procedure

============================================================
55. FEATURE FLAGS
============================================================

Create feature flag system.

Examples:

enable_qr_ordering
enable_online_ordering
enable_ai_manager
enable_forecasting
enable_marketing
enable_loyalty
enable_multi_branch
enable_kiosk

Allow features to be activated by:

- Restaurant
- Branch
- Environment

============================================================
56. BILLING / SAAS READINESS
============================================================

Architect system so RestaurantOS can eventually become SaaS.

Support conceptually:

Tenant
Restaurant
Branch
Subscription
Plan
FeatureEntitlement
BillingRecord

Plans could have:

Starter
Professional
Enterprise

Do not implement real payment billing unless requested,
but keep architecture ready for it.

============================================================
57. WHITE-LABEL READINESS
============================================================

Allow restaurants to customize:

- Logo
- Restaurant name
- Theme
- Accent color
- Receipt branding
- Domain/subdomain
- Email branding

Do not hardcode a single restaurant's identity.

============================================================
58. BACKWARD COMPATIBILITY
============================================================

All existing functionality must continue working.

Do NOT break:

- POS
- KDS
- Tables
- Inventory
- Delivery
- CRM
- Kiosk
- Reports
- Staff
- Authentication

All database migrations must be reversible where practical.

============================================================
59. IMPLEMENTATION STRATEGY
============================================================

Implement in this order:

PHASE 1
Analytics foundation
Business metrics
Health score
Command center

PHASE 2
Profitability
Menu engineering
Pricing intelligence

PHASE 3
Inventory forecasting
Purchase recommendations
Supplier intelligence
Waste intelligence

PHASE 4
Customer intelligence
Segmentation
Churn detection
LTV
Marketing

PHASE 5
QR ordering
Online ordering
Waitlist
Reservation intelligence

PHASE 6
Staff performance
Attendance
Scheduling

PHASE 7
Risk center
Fraud detection
Approvals

PHASE 8
Kitchen analytics
Quality control
Feedback

PHASE 9
Branch intelligence
Expense intelligence
Targets

PHASE 10
Forecasting
Demand planning

PHASE 11
AI Manager
Recommendations engine

PHASE 12
Performance
Security
Observability
Testing
Deployment
Documentation

============================================================
60. AI IMPLEMENTATION RULES
============================================================

AI must be OPTIONAL.

Core business functions must work without AI.

AI must never become a dependency for:

- taking orders
- paying
- inventory transactions
- refunds
- table management
- kitchen operations

AI is an enhancement layer.

AI recommendations must be explainable.

Use:

confidence
reason
source metrics
expected impact
risk

AI should recommend.

Human users approve sensitive actions.

============================================================
61. FINAL ACCEPTANCE CRITERIA
============================================================

The final system is accepted only if:

- Existing RestaurantOS modules still work.
- Managers can understand business performance quickly.
- Profitability can be calculated.
- Menu items can be analyzed by sales and profit.
- Inventory demand can be forecast.
- Purchase recommendations can be generated.
- Waste can be financially analyzed.
- Customers can be segmented.
- At-risk customers can be identified.
- Marketing ROI can be measured.
- QR ordering works.
- Online ordering works.
- Waitlist works.
- Reservations integrate with tables.
- Staff performance can be analyzed.
- Sensitive operations have approval workflows.
- Suspicious activity can be detected.
- Kitchen bottlenecks can be identified.
- Customer feedback can be tracked.
- Branches can be compared.
- Management targets can be tracked.
- Sales demand can be forecast.
- Business alerts work.
- Recommendations explain their reasoning.
- Analytics do not slow down POS.
- Backend permissions protect every sensitive API.
- Critical operations are audited.
- Automated tests cover critical workflows.
- Documentation is complete.
- Docker/deployment remains functional.

============================================================
62. FINAL ENGINEERING INSTRUCTION
============================================================

DO NOT create a simple mockup.

DO NOT create empty buttons.

DO NOT create fake analytics.

DO NOT hardcode fake business results into production screens.

DO NOT bypass backend permissions.

DO NOT expose database credentials.

DO NOT put business logic only in React.

DO NOT put expensive analytics inside synchronous POS requests.

DO NOT automatically execute financially sensitive AI recommendations.

DO NOT destroy existing project modules.

Build real end-to-end functionality.

For every new feature:

1. Database model
2. Migration
3. Serializer/schema
4. Service/business logic
5. API endpoint
6. Permission
7. Frontend page/component
8. Validation
9. Error handling
10. Loading states
11. Audit logging where required
12. Tests
13. Documentation

Use modular architecture.

Keep business logic reusable.

Use clean naming.

Use type-safe interfaces where possible.

Use transactions for financial and inventory operations.

Use Decimal for money.

Use UTC internally and configured restaurant timezone for display.

Use indexes for high-volume queries.

============================================================
63. REQUIRED FINAL OUTPUT FROM THE CODING AGENT
============================================================

Return:

1. Updated architecture
2. Updated folder structure
3. Updated database ERD
4. New database models
5. API endpoint catalog
6. Permission matrix
7. Backend implementation
8. Frontend implementation
9. Analytics architecture
10. Background jobs
11. WebSocket events
12. Test suite
13. Seed data
14. Environment variables example
15. Docker configuration
16. Deployment instructions
17. Migration instructions
18. API documentation
19. User documentation
20. Admin documentation
21. Security documentation
22. Performance recommendations

Show every generated file using:

FILE: path/to/file

Then provide its complete content.

Do not omit important files.

Do not replace implementation with pseudocode.

If the project already contains a similar module,
extend/refactor it rather than creating duplicate systems.

The final result must feel like a real commercial Restaurant Operating
System that a restaurant owner could use to operate, analyze and grow
the business.

END OF SPECIFICATION.
`;

module.exports = restaurantOSAdvancedPrompt;
```
