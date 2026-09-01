```javascript
const deliveryCustomerPrompt = `
You are a SENIOR RESTAURANT POS ENGINEER, SENIOR DJANGO DEVELOPER,
SENIOR REACT DEVELOPER, DATABASE ARCHITECT, UX/UI ENGINEER,
SECURITY ENGINEER and RESTAURANT OPERATIONS EXPERT.

You are extending the existing RestaurantOS project.

============================================================
PROJECT CONTEXT
============================================================

RestaurantOS already contains:

- POS
- Delivery
- Customer CRM
- Orders
- Payments
- Tables
- Kitchen
- Drivers
- Staff/RBAC
- Reports

The existing system already supports customers and delivery orders.
This feature must integrate with the existing architecture instead of
creating duplicate customer/order systems.

============================================================
FEATURE NAME
============================================================

DELIVERY CUSTOMER MANAGEMENT & REPEAT ORDER SYSTEM

Primary goal:

Make it extremely fast for a cashier to receive a delivery phone order,
find an existing customer, reuse their information, create or update
their address, take the order, send it to the kitchen and dispatch it.

The experience should be optimized for real restaurant phone orders.

============================================================
1. DELIVERY ORDER START
============================================================

When cashier selects:

ORDER TYPE = DELIVERY

Open:

"Delivery Customer"

The system must immediately provide:

------------------------------------------------------------
SEARCH EXISTING CUSTOMER
------------------------------------------------------------

Search box placeholder:

"Search by name or phone number..."

Allow search by:

- Full phone number
- Partial phone number
- Customer name
- Partial customer name
- Alternative phone number
- Customer ID
- Order number

Search must be fast.

Use debounced search.

Do not load thousands of customers into the browser.

Search must happen through an optimized backend endpoint.

============================================================
2. PHONE NUMBER-FIRST WORKFLOW
============================================================

The recommended cashier workflow is:

Cashier enters phone number.

Example:

01012345678

System searches the customer database.

Possible results:

------------------------------------------------------------
EXISTING CUSTOMER
------------------------------------------------------------

Ahmed Mohamed

Phone:
01012345678

Last Order:
#D-10452

Last Order Date:
2026-08-30

Last Address:
New Cairo
Street 90
Building 15
Apartment 6

Favorite Items:
Chicken Ranch Pizza
Cola
French Fries

Orders:
27

Lifetime Spend:
X

------------------------------------------------------------

Cashier can select:

"Use Customer"

Then automatically populate:

- Customer name
- Primary phone
- Secondary phone
- Delivery address
- Saved addresses
- Customer notes
- Delivery notes
- Previous order information

============================================================
3. NEW CUSTOMER WORKFLOW
============================================================

If no customer exists:

Show:

"New Customer"

Required fields:

- Customer name
- Phone number
- Address

Optional:

- Secondary phone
- Email
- Area
- Building
- Floor
- Apartment
- Landmark
- Delivery notes
- Customer notes

Example:

Customer Name:
Ahmed Mohamed

Phone:
01012345678

Address:
New Cairo, Street 90, Building 15,
Floor 2, Apartment 6

Landmark:
Next to XYZ Pharmacy

Delivery Note:
Call before arrival.

Customer Note:
Prefers less spicy food.

============================================================
4. PHONE NUMBER VALIDATION
============================================================

Phone numbers must be normalized before searching.

Support configured restaurant country.

For Egypt:

Accept formats such as:

01012345678
+201012345678
201012345678
010-1234-5678

Normalize into one canonical format.

Store:

normalized_phone

Also preserve:

display_phone

Prevent duplicate customers based on normalized phone where appropriate.

Do NOT treat formatting differences as different customers.

============================================================
5. CUSTOMER DUPLICATE DETECTION
============================================================

When cashier creates a new customer:

System checks:

- Normalized phone
- Alternative phone
- Similar customer name
- Existing addresses

If possible duplicate exists:

Show:

"Possible existing customer found"

Example:

Ahmed Mohamed
01012345678

"Use existing customer?"

Buttons:

[USE CUSTOMER]
[CREATE NEW ANYWAY]

Only users with appropriate permission can force duplicate creation.

============================================================
6. CUSTOMER PROFILE
============================================================

Create a detailed customer profile:

/customers/:id

Display:

------------------------------------------------------------
CUSTOMER INFORMATION
------------------------------------------------------------

Name
Primary phone
Secondary phone
Email

------------------------------------------------------------
ADDRESSES
------------------------------------------------------------

Home
Work
Other

Each address should contain:

- Label
- Area
- City
- Street
- Building
- Floor
- Apartment
- Landmark
- Extra details
- Delivery instructions
- Latitude
- Longitude
- Default address

------------------------------------------------------------
ORDER HISTORY
------------------------------------------------------------

Order Number
Date
Total
Order Type
Payment Method
Status

Allow:

"View Order"

============================================================
7. MULTIPLE CUSTOMER ADDRESSES
============================================================

One customer may have multiple addresses.

Example:

Ahmed Mohamed

Addresses:

1. Home
   New Cairo
   Street 90
   Building 15
   Apt 6

2. Work
   Nasr City
   Abbas El Akkad
   Building 8

3. Family
   Maadi
   Street 9
   Building 21

Allow:

- Add address
- Edit address
- Delete address
- Set default
- Select address during order

============================================================
8. DELIVERY ADDRESS SCREEN
============================================================

During a delivery order:

Show selected customer.

Then:

SELECT DELIVERY ADDRESS

Customer's saved addresses appear as cards.

Example:

[HOME]
New Cairo
Street 90
Building 15
Apartment 6
Landmark: XYZ Pharmacy

[WORK]
Nasr City
Abbas El Akkad
Building 8

[+ ADD NEW ADDRESS]

If customer has only one address,
automatically select it but still allow editing.

============================================================
9. QUICK ADDRESS EDIT
============================================================

Cashier must be able to edit address directly from the order screen.

Do not force cashier to leave POS.

Example:

Selected Address:

New Cairo
Street 90
Building 15

[Edit]

Open small modal.

Fields:

Area
Street
Building
Floor
Apartment
Landmark
Delivery note

Save.

The updated information can be:

- Used only for this order
OR
- Saved to customer address

Ask:

"Save changes to customer address?"

[YES]
[ORDER ONLY]

============================================================
10. DELIVERY NOTES
============================================================

Separate:

CUSTOMER NOTE

and

DELIVERY NOTE

Customer Note example:

"Customer prefers no spicy food."

Delivery Note:

"Call customer when outside."

Kitchen Note:

"No onions."

These must remain separate.

------------------------------------------------------------
Customer Note
------------------------------------------------------------

Visible in customer profile.

------------------------------------------------------------
Delivery Note
------------------------------------------------------------

Visible to dispatcher/driver.

------------------------------------------------------------
Kitchen Note
------------------------------------------------------------

Visible to kitchen where relevant.

Do not expose private internal notes to customers or drivers.

============================================================
11. CREATE DELIVERY ORDER
============================================================

After customer is selected:

Show:

------------------------------------------------------------
DELIVERY ORDER
------------------------------------------------------------

Customer:
Ahmed Mohamed

Phone:
01012345678

Address:
New Cairo
Street 90
Building 15
Floor 2
Apartment 6

Landmark:
XYZ Pharmacy

Delivery Note:
Call before arrival.

------------------------------------------------------------

ORDER ITEMS

Add products exactly like normal POS.

Support:

- Categories
- Subcategories
- Variants
- Modifiers
- Quantity
- Item notes
- Discounts
- Promotions
- Combos
- Special instructions

============================================================
12. DELIVERY ORDER SUMMARY
============================================================

Show:

Subtotal
Discount
Tax
Service Fee if applicable
Delivery Fee
Final Total

Example:

Subtotal:          450
Discount:           50
Tax:                20
Delivery Fee:       30
-----------------------
TOTAL:             450

Use Decimal-safe calculations.

Never use JavaScript floating point for final financial calculations.

Backend must calculate and validate final totals.

============================================================
13. DELIVERY FEE
============================================================

Support configurable delivery fee calculation.

Methods:

1. Flat fee

2. Area fee

3. Distance fee

4. Free delivery above threshold

5. Promotion-based delivery fee

6. Branch-specific fee

Example:

New Cairo = 30

Maadi = 40

Nasr City = 35

Manager can configure delivery zones.

============================================================
14. CUSTOMER SEARCH DURING A CALL
============================================================

Optimize for repeated phone calls.

Scenario:

Customer calls again.

Cashier:

1. Opens Delivery
2. Enters phone number
3. Customer instantly appears
4. Clicks customer
5. Selects saved address
6. Previous order history appears
7. Cashier can repeat last order

This must take as few actions as possible.

============================================================
15. REPEAT LAST ORDER
============================================================

Add button:

"REPEAT LAST ORDER"

For existing customers.

System displays:

Last Order #D-10452

Chicken Ranch Pizza x2
Large Fries x1
Cola x2

Buttons:

[ADD TO NEW ORDER]

Before adding:

Revalidate:

- Current menu price
- Current availability
- Current modifiers
- Current promotions

Do NOT blindly copy historical prices.

============================================================
16. FAVORITE / FREQUENT ITEMS
============================================================

Calculate popular customer items.

Display:

Frequently Ordered:

Chicken Ranch Pizza
Cola
Fries

Provide quick add buttons.

============================================================
17. CUSTOMER ORDER TIMELINE
============================================================

Customer profile should show:

Timeline:

2026-08-30
Delivery order
450

2026-08-18
Delivery order
620

2026-08-05
Takeaway order
220

Click order to see details.

============================================================
18. CUSTOMER LIFETIME INFORMATION
============================================================

Display:

Total Orders
Delivery Orders
Dine-in Orders
Takeaway Orders
Lifetime Spend
Average Order Value
Last Order Date
Favorite Category
Favorite Product
Default Address
Loyalty Points
Customer Tier

============================================================
19. CUSTOMER SEARCH RESULT DESIGN
============================================================

Search result cards should show:

CUSTOMER NAME
PHONE
DEFAULT AREA
LAST ORDER
TOTAL ORDERS

Example:

------------------------------------------------
Ahmed Mohamed
01012345678

New Cairo

Last Order:
Chicken Ranch Pizza

Orders: 27

[SELECT]
------------------------------------------------

If multiple customers have similar names:

Show all results clearly.

============================================================
20. SMART SEARCH
============================================================

Search must support:

Exact phone
Partial phone
Exact name
Partial name
Multiple words
Customer ID

Examples:

01012345678

0123

Ahmed

Ahmed Mohamed

Search results should prioritize:

1. Exact phone
2. Exact normalized phone
3. Exact name
4. Partial phone
5. Partial name

============================================================
21. CUSTOMER PHONE CALL INTERFACE
============================================================

Create optional interface:

"Incoming Call"

Example:

INCOMING CALL

01012345678

Searching customer...

Result:

Ahmed Mohamed
27 previous orders

[OPEN CUSTOMER]
[CREATE NEW]

This architecture should be ready for future
telephony/VoIP integrations.

Do not implement real telephony hardware unless explicitly requested.

============================================================
22. CUSTOMER QUICK ACTIONS
============================================================

From customer profile:

[NEW DELIVERY ORDER]
[NEW TAKEAWAY ORDER]
[VIEW HISTORY]
[MANAGE ADDRESSES]
[ADD NOTE]
[ADD LOYALTY]
[VIEW FEEDBACK]

============================================================
23. DELIVERY DRIVER INFORMATION
============================================================

After order preparation:

Delivery order enters:

READY FOR DISPATCH

Dispatcher can assign driver.

Driver receives:

Customer Name
Phone
Address
Landmark
Delivery Note
Order Number
Amount to Collect

Do not expose unnecessary customer information.

============================================================
24. CASH ON DELIVERY
============================================================

Support:

Payment Method:

CASH ON DELIVERY

Show driver:

Amount to Collect

Example:

TOTAL TO COLLECT:

450 EGP

After delivery:

Driver selects:

[DELIVERED]
[FAILED DELIVERY]

If delivered:

Enter collected amount.

System validates amount.

If amount differs:

Require explanation / manager workflow.

============================================================
25. ONLINE PAYMENT
============================================================

Support:

- Paid Online
- Cash on Delivery
- Card
- Wallet
- Other configured methods

For online payments:

Driver must NOT collect payment again.

Display prominently:

PAID ONLINE

============================================================
26. FAILED DELIVERY
============================================================

Allow reasons:

- Customer unavailable
- Wrong address
- Customer refused
- Phone unreachable
- Restaurant issue
- Driver issue
- Other

Require note where configured.

Store:

failure reason
note
driver
timestamp

============================================================
27. CUSTOMER CANCELLATION HISTORY
============================================================

Track:

Customer cancellations

Driver cancellations

Restaurant cancellations

Reasons

Do not automatically punish customers based on raw cancellation counts.

Use configurable business rules.

============================================================
28. CUSTOMER NOTES
============================================================

Allow authorized staff to add notes.

Example:

"Usually orders on Friday."

"Do not ring bell."

"Building entrance is from side street."

All notes should have:

- Created by
- Created at
- Updated by
- Updated at

Optional note categories:

- Delivery
- Food preference
- Communication
- Address
- VIP
- Other

============================================================
29. PRIVACY
============================================================

Protect customer personal data.

Permissions required for:

- Viewing full phone number
- Editing customer
- Viewing customer history
- Exporting customers
- Deleting customer data

Never expose customer phone/address unnecessarily.

============================================================
30. CUSTOMER DATA MODEL
============================================================

Extend or integrate with existing Customer model.

Recommended fields:

Customer:
- id
- customer_code
- first_name
- last_name
- full_name
- primary_phone
- normalized_phone
- secondary_phone
- normalized_secondary_phone
- email
- notes
- customer_status
- loyalty_tier
- loyalty_points
- lifetime_spend
- total_orders
- last_order_at
- created_at
- updated_at

CustomerAddress:
- id
- customer_id
- label
- city
- area
- street
- building
- floor
- apartment
- landmark
- instructions
- latitude
- longitude
- is_default
- is_active
- created_at
- updated_at

CustomerNote:
- id
- customer_id
- note_type
- content
- created_by
- created_at
- updated_at

============================================================
31. DELIVERY ORDER MODEL
============================================================

DeliveryOrder should reference:

- order
- customer
- customer_address
- driver
- delivery_zone
- delivery_fee
- delivery_note
- delivery_status
- estimated_time
- assigned_at
- picked_up_at
- delivered_at
- failed_at
- failure_reason

============================================================
32. CUSTOMER ORDER RELATIONSHIP
============================================================

Customer:

1
↓
Many Orders

Customer:

1
↓
Many Addresses

Customer:

1
↓
Many Notes

Order:

1
↓
0/1 DeliveryOrder

DeliveryOrder:

1
↓
1 CustomerAddress

This relationship must be enforced correctly.

============================================================
33. API ENDPOINTS
============================================================

Create/extend:

GET /api/customers/search/?q=

GET /api/customers/?phone=

GET /api/customers/{id}/

POST /api/customers/

PATCH /api/customers/{id}/

GET /api/customers/{id}/orders/

GET /api/customers/{id}/addresses/

POST /api/customers/{id}/addresses/

PATCH /api/customers/{id}/addresses/{address_id}/

DELETE /api/customers/{id}/addresses/{address_id}/

GET /api/customers/{id}/favorites/

GET /api/customers/{id}/last-order/

POST /api/customers/{id}/repeat-last-order/

GET /api/delivery-orders/

POST /api/delivery-orders/

PATCH /api/delivery-orders/{id}/

POST /api/delivery-orders/{id}/assign-driver/

POST /api/delivery-orders/{id}/mark-picked-up/

POST /api/delivery-orders/{id}/mark-delivered/

POST /api/delivery-orders/{id}/mark-failed/

============================================================
34. SEARCH PERFORMANCE
============================================================

Optimize customer search.

Required:

- Database index on normalized_phone
- Index on customer name
- Index on created_at
- Index on last_order_at
- Prefix-friendly search where appropriate

For large customer databases:

Use:

- pagination
- server-side filtering
- debounce
- query limits
- optimized indexes

Do not execute unrestricted LIKE queries against millions of records.

============================================================
35. CUSTOMER CREATION RULE
============================================================

Before creating:

1. Normalize phone.
2. Search exact normalized phone.
3. Check possible duplicate.
4. Show existing customer if found.
5. Allow authorized user to create duplicate only with explicit action.

============================================================
36. POS UX
============================================================

Delivery order page should use this structure:

------------------------------------------------------------
CUSTOMER
------------------------------------------------------------

[Search by name or phone]

Customer result

[Use Customer]

------------------------------------------------------------
ADDRESS
------------------------------------------------------------

Saved addresses

[Use]
[Edit]
[Add Address]

------------------------------------------------------------
ORDER
------------------------------------------------------------

Categories
Products
Cart

------------------------------------------------------------
DELIVERY
------------------------------------------------------------

Delivery Zone
Delivery Fee
Driver
Delivery Note

------------------------------------------------------------
PAYMENT
------------------------------------------------------------

Cash
Card
Wallet
Online

------------------------------------------------------------
TOTAL
------------------------------------------------------------

[CREATE ORDER]

============================================================
37. QUICK CASHIER WORKFLOW
============================================================

Optimize common scenario:

CUSTOMER CALLS

Cashier:

Search phone
→ Select customer
→ Select address
→ Click Repeat Last Order OR build new order
→ Verify items
→ Add/change items
→ Add delivery note
→ Confirm payment method
→ Confirm order

Target:

Less than 30 seconds for an experienced cashier
for a simple repeat order.

============================================================
38. PREVIOUS ORDER INTELLIGENCE
============================================================

When customer is selected, show:

Last Order

and:

Top 3 Previous Items

and:

Favorite Category

Do not automatically add items.

Cashier must explicitly choose.

============================================================
39. ORDER HISTORY FILTERS
============================================================

Customer history filters:

- All
- Delivery
- Takeaway
- Dine-in
- Completed
- Cancelled
- Refunded

Date range filter.

============================================================
40. CUSTOMER STATISTICS
============================================================

Calculate:

- Total orders
- Completed orders
- Cancelled orders
- Average order value
- Total delivery spend
- Last order date
- Average days between orders
- Favorite item
- Favorite category
- Preferred payment
- Preferred ordering time

============================================================
41. LOYALTY INTEGRATION
============================================================

When an eligible delivery order is completed:

- Add loyalty points
- Update lifetime spend
- Update customer tier

If order is refunded:

Reverse or adjust loyalty according to configured rules.

Do not double-award points.

============================================================
42. CUSTOMER PROMOTIONS
============================================================

During order creation:

Show eligible promotions.

Example:

"Customer has 200 loyalty points."

"VIP customer: Gold."

"Available promotion: 15% off delivery order."

Do not automatically apply promotions unless configured.

Show discount source clearly.

============================================================
43. CUSTOMER SAFETY / SPECIAL REQUIREMENTS
============================================================

If customer has authorized dietary/allergen notes:

Display warning where appropriate.

Example:

ALLERGY INFORMATION

Contains:
Peanuts

This information must never replace proper restaurant allergen procedures.

============================================================
44. AUDIT LOG
============================================================

Track:

Customer created
Customer edited
Phone changed
Address created
Address edited
Address deleted
Customer selected for order
Order created
Order cancelled
Order refunded
Delivery status changed

Sensitive changes should record:

- user
- old value
- new value
- timestamp
- IP/device where available

============================================================
45. ROLE PERMISSIONS
============================================================

Add:

customers.search
customers.view
customers.create
customers.edit
customers.delete
customers.export

addresses.view
addresses.create
addresses.edit
addresses.delete

customer_notes.view
customer_notes.create
customer_notes.edit

delivery.create
delivery.edit
delivery.assign_driver
delivery.complete
delivery.fail

repeat_order.use

Suggested defaults:

CASHIER:
- Search customer
- View necessary customer data
- Create customer
- Create/edit delivery address
- Create delivery order
- Repeat order

CAPTAIN:
- No delivery customer access unless explicitly granted.

KITCHEN:
- Only relevant order/kitchen information.

DRIVER:
- Assigned delivery information only.

MANAGER:
- Full access.

OWNER:
- Full access.

============================================================
46. DELIVERY STATUS
============================================================

Use:

NEW
CONFIRMED
PREPARING
READY_FOR_DISPATCH
ASSIGNED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
FAILED
CANCELLED

Every status transition must be validated.

============================================================
47. DELIVERY ETA
============================================================

Calculate estimated delivery time using:

- Kitchen preparation estimate
- Current kitchen queue
- Driver availability
- Delivery zone
- Historical delivery duration

Example:

Estimated:

35-45 minutes

Do not promise an exact time unless operationally supported.

============================================================
48. DRIVER VIEW
============================================================

Driver mobile screen:

------------------------------------------------
DELIVERY #D-10452

Ahmed Mohamed
01012345678

New Cairo
Street 90
Building 15
Apartment 6

Landmark:
XYZ Pharmacy

Amount to Collect:
450 EGP

[CALL]
[OPEN MAP]
[START DELIVERY]
[DELIVERED]
[FAILED]
------------------------------------------------

============================================================
49. CUSTOMER-FACING ORDER TRACKING
============================================================

Optional public tracking page:

Order #D-10452

Received
✓
Preparing
✓
Ready
✓
Out for Delivery
●
Delivered

Do not expose internal staff information.

============================================================
50. FUTURE TELEPHONY READINESS
============================================================

Design architecture for future:

VoIP
SIP
Call Center
Twilio
Cloud telephony

When incoming call occurs:

Phone number
→ Normalize
→ Search customer
→ Show customer profile

Do not hardcode a specific telephony provider.

============================================================
51. CUSTOMER SEARCH RESULT RANKING
============================================================

Scoring example:

Exact normalized phone = highest priority

Exact name = next

Starts with phone/name = next

Contains phone/name = lower

Recent customers may receive a small relevance boost,
but exact matches always win.

============================================================
52. ERROR HANDLING
============================================================

Examples:

Invalid phone:
"Enter a valid phone number."

Customer not found:
"No customer found. Create new customer?"

Duplicate:
"This phone number is already linked to a customer."

Address missing:
"Delivery address is required."

Invalid address:
"Please complete required address information."

Payment failure:
"Payment could not be completed."

Driver unavailable:
"No delivery driver is currently available."

============================================================
53. OFFLINE/NETWORK FAILURE
============================================================

Because POS is business-critical:

If network connectivity is temporarily lost,
the interface should clearly indicate:

OFFLINE MODE

Do not pretend that server-side customer data
is available when it is not.

Implement offline support only where the existing
architecture can safely guarantee synchronization.

Do not create duplicate orders during reconnect.

============================================================
54. DATABASE INTEGRITY
============================================================

Use:

- Foreign keys
- Unique constraints where appropriate
- Database indexes
- Transactions
- Decimal financial fields
- Soft delete where appropriate
- Audit logs

Critical operations must be atomic.

============================================================
55. TEST CASES
============================================================

Implement tests:

1. Search customer by exact phone
2. Search customer by partial phone
3. Search customer by exact name
4. Search customer by partial name
5. Normalize Egyptian phone number
6. Create new customer
7. Detect duplicate phone
8. Create customer address
9. Select default address
10. Edit address
11. Create delivery order
12. Calculate delivery fee
13. Repeat last order
14. Revalidate historical product price
15. Revalidate product availability
16. Assign driver
17. Mark picked up
18. Mark delivered
19. Mark failed
20. Cash on delivery
21. Online payment
22. Refund delivery order
23. Loyalty points
24. Customer notes
25. RBAC
26. Audit log
27. Search pagination
28. Duplicate payment prevention

============================================================
56. SECURITY TESTING
============================================================

Verify:

- Cashier cannot access manager-only customer data.
- Driver cannot access unrelated customers.
- Driver cannot edit customer phone.
- Driver cannot modify order total.
- Cashier cannot issue unauthorized refund.
- Customer cannot access another customer's order.
- Public QR/order links cannot expose private customer information.
- API validates ownership/authorization.

============================================================
57. UI DESIGN
============================================================

The delivery flow should use the existing RestaurantOS
dark premium restaurant design.

Important UX characteristics:

- Large phone search field
- Instant search
- Clear customer cards
- Clear address cards
- Fast order creation
- Minimal modal depth
- Keyboard support
- Touch support
- Mobile/tablet compatible
- Clear delivery status
- Prominent total
- Prominent payment method

Use strong visual hierarchy.

============================================================
58. FINAL CUSTOMER FLOW
============================================================

NEW CUSTOMER:

Delivery
→ Enter phone
→ No result
→ New customer
→ Name
→ Phone
→ Address
→ Save
→ Create order
→ Add products
→ Delivery note
→ Payment
→ Confirm
→ Kitchen
→ Dispatch
→ Driver
→ Delivered
→ Customer history updated

RETURNING CUSTOMER:

Delivery
→ Enter phone
→ Existing customer found
→ Select customer
→ Select saved address
→ Show last order
→ Repeat Last Order or new order
→ Modify if necessary
→ Confirm
→ Kitchen
→ Dispatch
→ Driver
→ Delivered
→ Customer statistics updated

============================================================
59. FUTURE EXPANSIONS
============================================================

Keep architecture ready for:

- WhatsApp ordering
- Instagram ordering
- Facebook ordering
- Voice ordering
- Call-center dashboard
- Automatic address geocoding
- Google Maps integration
- Delivery route optimization
- Customer segmentation
- Churn prediction
- Marketing automation
- Customer lifetime value
- AI order assistant

These must be optional modules.

============================================================
60. FINAL ENGINEERING RULES
============================================================

Do not build fake customer search.

Do not store duplicate phone formats as separate identities.

Do not use frontend-only validation.

Do not trust frontend totals.

Do not expose private customer information unnecessarily.

Do not automatically modify customer data without user action.

Do not automatically repeat historical prices.

Do not automatically execute refunds.

Do not give drivers unnecessary permissions.

Do not physically delete financial order history.

Do not create duplicate order systems.

Integrate with existing RestaurantOS Customer,
Order and Delivery models where possible.

Every feature must work end-to-end:

Database
→ Django Model
→ Serializer
→ Service
→ API
→ Permission
→ React Hook/API
→ UI
→ Validation
→ Error Handling
→ Audit Log
→ Tests

============================================================
61. REQUIRED DELIVERABLES
============================================================

Return:

1. Updated database schema
2. Customer model changes
3. CustomerAddress model
4. CustomerNote model
5. DeliveryOrder changes
6. API endpoints
7. Search implementation
8. Phone normalization service
9. Duplicate detection service
10. Repeat-order service
11. Delivery workflow service
12. Permission matrix
13. React delivery UI
14. Customer search component
15. Customer profile component
16. Address selector
17. New customer modal
18. Repeat order UI
19. Driver delivery screen
20. Tests
21. Seed data
22. API documentation
23. Migration instructions

For each file output:

FILE: exact/path/to/file

Then provide complete code.

Do not provide pseudo-code for core functionality.

Do not omit integration code.

============================================================
62. SUCCESS CRITERIA
============================================================

The feature is successful when a cashier receives a phone call and can:

1. Enter phone number.
2. Find the customer immediately.
3. See previous order information.
4. Select existing customer.
5. Select saved address.
6. Create a new order.
7. Repeat last order when desired.
8. Change quantities/products.
9. Add delivery note.
10. Confirm payment.
11. Send order to kitchen.
12. Dispatch driver.
13. Track delivery.
14. Close delivery.
15. Automatically update customer history.

The entire workflow should be optimized for speed,
accuracy, security and customer retention.

END OF DELIVERY CUSTOMER MANAGEMENT SPECIFICATION.
`;

module.exports = deliveryCustomerPrompt;
```
