```json
{
  "project": {
    "name": "RestaurantOS",
    "type": "Full Restaurant POS, Order Management, Kitchen, Delivery, Inventory, Staff and Business Intelligence System",
    "goal": "Build a complete production-ready restaurant management platform for restaurants, cafes and food businesses. The system must support cashier, manager, captain/waiter, kitchen, delivery and administration workflows with strict role-based permissions.",
    "quality_standard": "Production-grade, scalable, secure, responsive, maintainable and deployment-ready",
    "design_principles": [
      "Fast POS workflow",
      "Minimum clicks for cashier and captain",
      "Mobile/tablet friendly waiter interface",
      "Desktop optimized manager dashboard",
      "Clear visual order status",
      "Role-based access control",
      "Auditability",
      "Real-time updates",
      "Offline-friendly POS architecture where practical",
      "API-first architecture",
      "Modular architecture",
      "Database normalization",
      "Strong validation",
      "Secure authentication",
      "High performance",
      "Clean modern black/dark premium restaurant UI"
    ]
  },

  "recommended_stack": {
    "frontend": {
      "framework": "React",
      "language": "TypeScript",
      "build_tool": "Vite",
      "state_management": "Redux Toolkit",
      "server_state": "RTK Query",
      "routing": "React Router",
      "styling": "Tailwind CSS",
      "component_library": "shadcn/ui",
      "forms": "React Hook Form",
      "validation": "Zod",
      "charts": "Recharts",
      "icons": "Lucide React",
      "real_time": "WebSocket / Socket.IO",
      "printing": "Browser print / thermal printer integration layer"
    },
    "backend": {
      "framework": "Django",
      "api": "Django REST Framework",
      "language": "Python",
      "authentication": "JWT with refresh tokens",
      "real_time": "Django Channels",
      "background_jobs": "Celery",
      "cache": "Redis",
      "task_scheduler": "Celery Beat"
    },
    "database": {
      "primary": "PostgreSQL",
      "optional": "MySQL",
      "cache": "Redis",
      "search": "PostgreSQL full text search"
    },
    "storage": {
      "images": "Cloudinary or S3-compatible storage",
      "documents": "S3-compatible storage"
    },
    "deployment": {
      "containers": "Docker",
      "reverse_proxy": "Nginx",
      "server": "Linux VPS / Cloud",
      "ssl": "Let's Encrypt",
      "ci_cd": "GitHub Actions"
    }
  },

  "core_roles": {
    "owner": {
      "description": "Business owner with complete system access",
      "permissions": ["ALL"]
    },
    "manager": {
      "description": "Full operational access except sensitive owner-only settings",
      "permissions": [
        "dashboard.view",
        "reports.view",
        "reports.export",
        "sales.view",
        "orders.view",
        "orders.create",
        "orders.edit",
        "orders.cancel",
        "orders.refund",
        "tables.view",
        "tables.create",
        "tables.edit",
        "tables.delete",
        "tables.merge",
        "tables.split",
        "menu.view",
        "menu.create",
        "menu.edit",
        "menu.delete",
        "categories.manage",
        "modifiers.manage",
        "users.view",
        "users.create",
        "users.edit",
        "users.disable",
        "roles.view",
        "inventory.view",
        "inventory.manage",
        "purchases.manage",
        "suppliers.manage",
        "expenses.manage",
        "customers.manage",
        "discounts.manage",
        "promotions.manage",
        "shift.manage",
        "cash_drawer.manage",
        "kitchen.view",
        "delivery.view",
        "settings.restaurant",
        "audit_logs.view"
      ]
    },
    "cashier": {
      "description": "Handles POS, payments and customer orders",
      "permissions": [
        "dashboard.limited",
        "orders.view",
        "orders.create",
        "orders.edit.before_payment",
        "orders.print",
        "orders.payment",
        "orders.split_payment",
        "orders.reprint_receipt",
        "tables.view",
        "customers.view",
        "customers.create",
        "discounts.use",
        "cash_drawer.open",
        "cash_drawer.close"
      ]
    },
    "captain": {
      "description": "Waiter/table service operator",
      "permissions": [
        "tables.view",
        "tables.open",
        "tables.assign",
        "tables.move",
        "tables.merge",
        "tables.split",
        "orders.create",
        "orders.view.own_tables",
        "orders.edit.own_orders",
        "orders.send_to_kitchen",
        "orders.add_items",
        "orders.remove_items.before_kitchen",
        "orders.notes",
        "customer.view"
      ]
    },
    "kitchen": {
      "description": "Kitchen staff responsible for production status",
      "permissions": [
        "kitchen.view",
        "kitchen.accept",
        "kitchen.start",
        "kitchen.ready",
        "kitchen.reject",
        "kitchen.notes"
      ]
    },
    "delivery": {
      "description": "Delivery operator/driver",
      "permissions": [
        "delivery.view_assigned",
        "delivery.update_status",
        "delivery.customer_view",
        "delivery.order_view"
      ]
    },
    "custom_role": {
      "description": "Manager can create custom roles and define permissions",
      "feature": true
    }
  },

  "authentication": {
    "features": [
      "Login",
      "Logout",
      "Refresh token",
      "Forgot password",
      "Reset password",
      "Change password",
      "Optional 2FA",
      "PIN login for POS users",
      "Device/session management",
      "Session timeout",
      "Force logout from manager dashboard",
      "Account lockout after configurable failed attempts"
    ]
  },

  "restaurant_configuration": {
    "restaurant_profile": [
      "name",
      "logo",
      "phone",
      "email",
      "address",
      "tax_number",
      "currency",
      "timezone",
      "language",
      "receipt_footer"
    ],
    "branches": {
      "enabled": true,
      "features": [
        "Multiple branches",
        "Branch-specific users",
        "Branch-specific menu",
        "Branch-specific inventory",
        "Branch-specific tables",
        "Branch-specific reports",
        "Central management"
      ]
    },
    "business_settings": [
      "tax configuration",
      "service charge",
      "delivery fee",
      "rounding",
      "receipt settings",
      "order numbering",
      "currency formatting",
      "business hours",
      "closing rules"
    ]
  },

  "pos_order_types": {
    "dine_in": {
      "enabled": true,
      "features": [
        "Table selection",
        "Captain assignment",
        "Guest count",
        "Table transfer",
        "Table merge",
        "Table split",
        "Open ticket",
        "Send to kitchen",
        "Bill generation"
      ]
    },
    "takeaway": {
      "enabled": true,
      "features": [
        "Customer name",
        "Phone",
        "Pickup time",
        "Takeaway receipt",
        "Order status"
      ]
    },
    "delivery": {
      "enabled": true,
      "features": [
        "Customer address",
        "Phone",
        "Delivery zone",
        "Delivery fee",
        "Driver assignment",
        "Estimated delivery time",
        "Delivery status",
        "Cash on delivery",
        "Online payment"
      ]
    },
    "pickup": {
      "enabled": true,
      "features": [
        "Pickup token",
        "Customer name",
        "Pickup status"
      ]
    }
  },

  "table_management": {
    "page": "Tables",
    "features": [
      "Create table",
      "Edit table",
      "Delete table",
      "Activate/deactivate table",
      "Assign table number",
      "Set seating capacity",
      "Set area/section",
      "Set floor",
      "Set table shape",
      "Set table position",
      "Drag and drop table layout",
      "Table status",
      "Assign captain",
      "Open order",
      "View active order",
      "Transfer table",
      "Merge tables",
      "Split tables",
      "Reserve table",
      "Mark table unavailable",
      "Quick order from table",
      "Print table bill"
    ],
    "table_statuses": [
      "available",
      "occupied",
      "reserved",
      "bill_requested",
      "payment_pending",
      "cleaning",
      "out_of_service"
    ],
    "table_fields": {
      "id": "UUID",
      "table_number": "string",
      "name": "string",
      "capacity": "integer",
      "area_id": "UUID",
      "floor_id": "UUID",
      "shape": "rectangle|round|square|custom",
      "status": "enum",
      "position_x": "number",
      "position_y": "number",
      "active": "boolean",
      "notes": "string"
    },
    "advanced": [
      "Graphical floor-plan editor",
      "Multiple floors",
      "Multiple dining sections",
      "Table occupancy timer",
      "Average table duration",
      "Table turnover analytics",
      "Color-coded table states"
    ]
  },

  "menu_management": {
    "hierarchy": {
      "category": "Pizza",
      "subcategories": [
        "Ranch",
        "Barbecue",
        "Spicy",
        "Seafood"
      ],
      "item": "Pizza Ranch Chicken",
      "variants": [
        "Small",
        "Medium",
        "Large",
        "Family"
      ]
    },
    "features": [
      "Create category",
      "Create subcategory",
      "Create menu item",
      "Edit menu item",
      "Delete menu item",
      "Enable/disable item",
      "Item image",
      "SKU",
      "Barcode",
      "Description",
      "Ingredients",
      "Allergens",
      "Preparation time",
      "Cost price",
      "Selling price",
      "Tax class",
      "Multiple sizes",
      "Multiple prices",
      "Modifiers",
      "Extras",
      "Combo meals",
      "Add-ons",
      "Availability schedule",
      "Branch availability",
      "Kitchen station mapping"
    ],
    "modifier_examples": [
      "Extra cheese",
      "Extra sauce",
      "No onion",
      "No tomato",
      "Extra spicy",
      "Add chicken",
      "Add mushrooms"
    ],
    "item_statuses": [
      "available",
      "out_of_stock",
      "hidden",
      "temporarily_unavailable"
    ]
  },

  "order_management": {
    "order_fields": [
      "order_number",
      "order_type",
      "table",
      "customer",
      "captain",
      "items",
      "modifiers",
      "notes",
      "discount",
      "tax",
      "service_charge",
      "delivery_fee",
      "subtotal",
      "grand_total",
      "payment_status",
      "order_status",
      "created_by",
      "created_at",
      "updated_at"
    ],
    "item_features": [
      "Quantity",
      "Unit price",
      "Discount",
      "Modifiers",
      "Kitchen note",
      "Customer note",
      "Item status",
      "Course",
      "Preparation priority"
    ],
    "workflow": [
      "draft",
      "confirmed",
      "sent_to_kitchen",
      "preparing",
      "ready",
      "served",
      "completed",
      "cancelled",
      "refunded"
    ],
    "advanced_features": [
      "Add items after order creation",
      "Partial item cancellation",
      "Order notes",
      "Kitchen notes",
      "Customer notes",
      "Repeat previous order",
      "Duplicate order",
      "Reopen order with permission",
      "Hold order",
      "Scheduled order",
      "Order history",
      "Refund history",
      "Order audit trail"
    ]
  },

  "split_and_merge_orders": {
    "enabled": true,
    "features": [
      "Split bill equally",
      "Split by item",
      "Split by guest",
      "Split custom amount",
      "Multiple payment methods",
      "Merge orders",
      "Move items between tickets",
      "Transfer table",
      "Transfer captain"
    ]
  },

  "guest_management": {
    "features": [
      "Guest count",
      "Customer profiles",
      "Customer phone",
      "Customer name",
      "Customer notes",
      "Address book",
      "Favorite orders",
      "Order history",
      "Customer spending",
      "Loyalty points",
      "Customer segmentation"
    ]
  },

  "payment_system": {
    "methods": [
      "cash",
      "card",
      "wallet",
      "bank_transfer",
      "online_payment",
      "mixed_payment",
      "custom"
    ],
    "features": [
      "Partial payment",
      "Split payment",
      "Change calculation",
      "Receipt printing",
      "Digital receipt",
      "Refund",
      "Partial refund",
      "Payment reversal",
      "Payment audit log",
      "Cash drawer integration"
    ]
  },

  "cashier_shift": {
    "features": [
      "Open shift",
      "Opening cash",
      "Cash sales",
      "Cash in",
      "Cash out",
      "Expenses",
      "Expected cash",
      "Actual cash",
      "Variance",
      "Close shift",
      "Manager approval for discrepancy"
    ]
  },

  "kitchen_management": {
    "system": "Kitchen Display System",
    "features": [
      "Real-time incoming orders",
      "Kitchen station routing",
      "Pizza station",
      "Grill station",
      "Fryer station",
      "Drinks station",
      "Dessert station",
      "Order priority",
      "Preparation timer",
      "Overdue indicator",
      "Item-level status",
      "Order-level status",
      "Recall order",
      "Ready notification"
    ],
    "statuses": [
      "new",
      "accepted",
      "preparing",
      "ready",
      "served"
    ]
  },

  "captain_waiter_system": {
    "features": [
      "View table map",
      "View assigned tables",
      "Open table",
      "Create order",
      "Add items",
      "Change quantity",
      "Add modifiers",
      "Add notes",
      "Send kitchen order",
      "Request bill",
      "Transfer table",
      "Merge table",
      "Split bill",
      "Mark served",
      "View active orders"
    ],
    "mobile_mode": {
      "enabled": true,
      "goal": "Allow waiter/captain to use phone/tablet as a handheld POS"
    }
  },

  "delivery_management": {
    "features": [
      "Delivery zones",
      "Zone-based fees",
      "Customer addresses",
      "Multiple addresses",
      "Driver management",
      "Driver assignment",
      "Driver availability",
      "Driver status",
      "Dispatch board",
      "Order tracking",
      "Delivery status",
      "Delivery performance",
      "Cash collected by driver",
      "Driver settlement"
    ],
    "statuses": [
      "new",
      "confirmed",
      "preparing",
      "ready_for_dispatch",
      "assigned",
      "picked_up",
      "out_for_delivery",
      "delivered",
      "cancelled"
    ]
  },

  "inventory_management": {
    "features": [
      "Ingredients",
      "Raw materials",
      "Units",
      "Recipes",
      "Bill of materials",
      "Stock in",
      "Stock out",
      "Stock adjustment",
      "Waste",
      "Transfers",
      "Purchase orders",
      "Suppliers",
      "Receiving",
      "Stock count",
      "Low stock alerts",
      "Expiry dates",
      "Batch tracking",
      "Cost tracking",
      "Inventory valuation"
    ],
    "recipe_system": {
      "enabled": true,
      "example": {
        "menu_item": "Chicken Pizza",
        "ingredients": [
          {
            "name": "Flour",
            "quantity": 0.25,
            "unit": "kg"
          },
          {
            "name": "Chicken",
            "quantity": 0.15,
            "unit": "kg"
          },
          {
            "name": "Cheese",
            "quantity": 0.1,
            "unit": "kg"
          }
        ]
      }
    },
    "automatic_stock_rules": [
      "Deduct ingredients when order is completed",
      "Optional deduction when kitchen starts",
      "Restore stock for eligible cancellations",
      "Record waste",
      "Track theoretical vs actual consumption"
    ]
  },

  "purchasing": {
    "features": [
      "Suppliers",
      "Purchase orders",
      "Purchase receiving",
      "Purchase invoice",
      "Supplier balance",
      "Purchase history",
      "Ingredient price history",
      "Minimum stock threshold"
    ]
  },

  "expenses": {
    "features": [
      "Expense categories",
      "Create expense",
      "Attach receipt",
      "Expense approval",
      "Cash expense",
      "Account expense",
      "Daily expense report",
      "Monthly expense report"
    ]
  },

  "discounts_promotions": {
    "features": [
      "Percentage discount",
      "Fixed discount",
      "Item discount",
      "Category discount",
      "Order discount",
      "Promo codes",
      "Happy hour",
      "Buy one get one",
      "Combo deals",
      "Scheduled promotions",
      "Customer-specific promotions",
      "Maximum discount permission",
      "Manager approval"
    ]
  },

  "loyalty": {
    "enabled": true,
    "features": [
      "Points",
      "Rewards",
      "Customer tiers",
      "Points expiration",
      "Birthday rewards",
      "Referral rewards",
      "Loyalty transactions"
    ]
  },

  "reservations": {
    "enabled": true,
    "features": [
      "Create reservation",
      "Calendar",
      "Customer details",
      "Guest count",
      "Table assignment",
      "Reservation status",
      "Arrival tracking",
      "No-show tracking",
      "Reservation reminders"
    ]
  },

  "reports": {
    "manager_dashboard": {
      "kpis": [
        "Today's sales",
        "Today's orders",
        "Average order value",
        "Open tables",
        "Occupied tables",
        "Delivery orders",
        "Takeaway orders",
        "Dine-in orders",
        "Gross sales",
        "Discounts",
        "Taxes",
        "Net sales",
        "Refunds",
        "Expenses",
        "Estimated profit"
      ]
    },
    "sales_reports": [
      "Daily sales",
      "Weekly sales",
      "Monthly sales",
      "Yearly sales",
      "Sales by hour",
      "Sales by day",
      "Sales by category",
      "Sales by item",
      "Sales by order type",
      "Sales by branch",
      "Sales by cashier",
      "Sales by captain",
      "Sales by payment method"
    ],
    "product_reports": [
      "Top selling items",
      "Worst selling items",
      "Most profitable items",
      "Item quantity sold",
      "Modifier sales",
      "Category performance"
    ],
    "staff_reports": [
      "Cashier performance",
      "Captain performance",
      "Orders per user",
      "Sales per user",
      "Cancelled orders",
      "Discount usage",
      "Refund activity"
    ],
    "table_reports": [
      "Table turnover",
      "Average table duration",
      "Sales by table",
      "Occupancy rate",
      "Revenue per table"
    ],
    "inventory_reports": [
      "Current stock",
      "Low stock",
      "Stock movement",
      "Waste report",
      "Consumption",
      "Theoretical consumption",
      "Variance"
    ],
    "financial_reports": [
      "Revenue",
      "Expenses",
      "Gross profit",
      "Net profit estimate",
      "Tax report",
      "Discount report",
      "Refund report",
      "Cash movement"
    ],
    "export_formats": [
      "PDF",
      "Excel",
      "CSV"
    ],
    "filters": [
      "Date range",
      "Branch",
      "User",
      "Category",
      "Item",
      "Order type",
      "Payment method"
    ]
  },

  "dashboard": {
    "manager": [
      "Revenue chart",
      "Orders chart",
      "Top products",
      "Order type distribution",
      "Payment distribution",
      "Open tables",
      "Kitchen orders",
      "Delivery queue",
      "Low stock alerts",
      "Pending approvals",
      "Recent activity"
    ],
    "cashier": [
      "Current shift",
      "Today's orders",
      "Quick order",
      "Open tables",
      "Pending payments"
    ],
    "captain": [
      "Assigned tables",
      "Open tables",
      "Orders waiting",
      "Ready orders",
      "Bill requests"
    ],
    "kitchen": [
      "New orders",
      "Preparing",
      "Ready",
      "Average preparation time"
    ]
  },

  "audit_and_security": {
    "audit_log": {
      "track": [
        "Login",
        "Logout",
        "Create",
        "Update",
        "Delete",
        "Cancel order",
        "Refund",
        "Discount",
        "Price change",
        "Table change",
        "Permission change",
        "Cash drawer action",
        "Inventory adjustment",
        "Settings change"
      ],
      "fields": [
        "user",
        "role",
        "action",
        "entity",
        "entity_id",
        "old_value",
        "new_value",
        "ip",
        "device",
        "timestamp"
      ]
    },
    "security": [
      "RBAC",
      "Object-level permissions",
      "JWT security",
      "Password hashing",
      "Rate limiting",
      "CSRF protection",
      "Input validation",
      "SQL injection protection",
      "XSS protection",
      "Permission checks on backend",
      "Do not trust frontend permissions",
      "Secure file upload",
      "Activity logging"
    ]
  },

  "notifications": {
    "channels": [
      "In-app",
      "Browser notification",
      "Email",
      "SMS",
      "WhatsApp integration layer"
    ],
    "events": [
      "New order",
      "Kitchen ready",
      "Low stock",
      "Reservation",
      "Payment received",
      "Delivery assigned",
      "Delivery completed",
      "Shift closing",
      "Cash variance",
      "Manager approval required"
    ]
  },

  "printing": {
    "supported_documents": [
      "Customer receipt",
      "Kitchen ticket",
      "Bar ticket",
      "Delivery receipt",
      "Daily report",
      "End-of-shift report",
      "Invoice"
    ],
    "features": [
      "80mm thermal printer",
      "58mm thermal printer",
      "A4 printer",
      "Multiple printers",
      "Kitchen-specific printers",
      "Automatic routing",
      "Reprint with permission"
    ]
  },

  "database_entities": [
    "User",
    "Role",
    "Permission",
    "Branch",
    "Restaurant",
    "Floor",
    "Area",
    "Table",
    "TableReservation",
    "Category",
    "SubCategory",
    "MenuItem",
    "MenuVariant",
    "ModifierGroup",
    "Modifier",
    "Recipe",
    "Ingredient",
    "Unit",
    "Supplier",
    "PurchaseOrder",
    "PurchaseOrderItem",
    "StockMovement",
    "WasteRecord",
    "Customer",
    "CustomerAddress",
    "Order",
    "OrderItem",
    "OrderItemModifier",
    "Payment",
    "Refund",
    "Discount",
    "Promotion",
    "Shift",
    "CashTransaction",
    "Expense",
    "KitchenStation",
    "KitchenTicket",
    "DeliveryZone",
    "Driver",
    "Delivery",
    "LoyaltyAccount",
    "LoyaltyTransaction",
    "AuditLog",
    "Notification",
    "SystemSetting"
  ],

  "api_modules": [
    "/api/auth/",
    "/api/users/",
    "/api/roles/",
    "/api/permissions/",
    "/api/restaurants/",
    "/api/branches/",
    "/api/floors/",
    "/api/areas/",
    "/api/tables/",
    "/api/reservations/",
    "/api/categories/",
    "/api/menu/",
    "/api/modifiers/",
    "/api/ingredients/",
    "/api/recipes/",
    "/api/suppliers/",
    "/api/purchases/",
    "/api/inventory/",
    "/api/customers/",
    "/api/orders/",
    "/api/payments/",
    "/api/refunds/",
    "/api/discounts/",
    "/api/promotions/",
    "/api/shifts/",
    "/api/cash-drawer/",
    "/api/kitchen/",
    "/api/delivery/",
    "/api/drivers/",
    "/api/loyalty/",
    "/api/reports/",
    "/api/expenses/",
    "/api/audit-logs/",
    "/api/notifications/",
    "/api/settings/"
  ],

  "frontend_pages": {
    "public": [
      "Login",
      "Forgot Password",
      "Reset Password"
    ],
    "manager": [
      "Dashboard",
      "POS",
      "Orders",
      "Tables",
      "Floor Plan",
      "Reservations",
      "Menu",
      "Categories",
      "Modifiers",
      "Inventory",
      "Recipes",
      "Suppliers",
      "Purchases",
      "Expenses",
      "Customers",
      "Delivery",
      "Drivers",
      "Kitchen",
      "Discounts",
      "Promotions",
      "Loyalty",
      "Users",
      "Roles",
      "Reports",
      "Audit Logs",
      "Settings"
    ],
    "cashier": [
      "POS",
      "Orders",
      "Tables",
      "Customers",
      "Shift",
      "Payments"
    ],
    "captain": [
      "Tables",
      "My Orders",
      "New Order",
      "Bill Requests"
    ],
    "kitchen": [
      "Kitchen Display"
    ],
    "delivery": [
      "Delivery Board",
      "Assigned Orders",
      "Driver Profile"
    ]
  },

  "pos_ui": {
    "layout": {
      "left": "Categories and subcategories",
      "center": "Menu items",
      "right": "Current order/cart"
    },
    "quick_actions": [
      "Search item",
      "Barcode scan",
      "Add quantity",
      "Remove item",
      "Modifiers",
      "Discount",
      "Customer",
      "Table",
      "Order type",
      "Send kitchen",
      "Hold",
      "Pay",
      "Print"
    ],
    "usability": [
      "Keyboard shortcuts",
      "Touch-friendly buttons",
      "Fast search",
      "Recent items",
      "Favorite items",
      "Popular items",
      "Responsive design"
    ]
  },

  "table_order_flow": {
    "example": [
      "Captain logs in",
      "Captain opens Tables",
      "Captain selects Table 12",
      "System asks number of guests",
      "Captain creates order",
      "Captain selects Pizza category",
      "Captain selects Pizza Ranch",
      "Captain selects Large",
      "Captain adds Extra Cheese",
      "Captain adds drinks",
      "Captain adds customer note",
      "Captain sends order to kitchen",
      "Kitchen receives order instantly",
      "Kitchen changes status to preparing",
      "Kitchen changes status to ready",
      "Captain receives notification",
      "Captain serves food",
      "Customer asks for bill",
      "Captain requests bill",
      "Cashier opens ticket",
      "Customer pays",
      "System closes order",
      "Table becomes available"
    ]
  },

  "delivery_flow": {
    "example": [
      "Cashier receives delivery order",
      "Customer is selected or created",
      "Address is selected",
      "System calculates delivery fee",
      "Items are added",
      "Order is confirmed",
      "Kitchen receives ticket",
      "Kitchen prepares order",
      "Order becomes ready",
      "Dispatcher assigns driver",
      "Driver receives order",
      "Driver picks up order",
      "Driver changes status to out_for_delivery",
      "Driver completes delivery",
      "Payment is confirmed",
      "Order closes"
    ]
  },

  "restaurant_floor_plan": {
    "features": [
      "Visual floor editor",
      "Drag and drop tables",
      "Table shapes",
      "Table labels",
      "Capacity shown",
      "Occupied state",
      "Reserved state",
      "Available state",
      "Bill requested state",
      "Area filters",
      "Floor filters",
      "Zoom",
      "Pan",
      "Save layout"
    ]
  },

  "real_time_system": {
    "use_websockets_for": [
      "New order",
      "Order status",
      "Kitchen status",
      "Table status",
      "Bill request",
      "Delivery assignment",
      "Notifications",
      "Inventory alerts"
    ]
  },

  "advanced_features_inspired_by_modern_pos_patterns": [
    "Multi-branch support",
    "Multi-floor table map",
    "Kitchen Display System",
    "Ingredient-level inventory",
    "Recipe costing",
    "Table turnover analytics",
    "Customer loyalty",
    "Reservations",
    "Scheduled orders",
    "Driver dispatch",
    "Split bills",
    "Mixed payments",
    "Item modifiers",
    "Combos",
    "Happy hour",
    "Customer history",
    "Supplier management",
    "Purchase orders",
    "Cash drawer management",
    "Shift management",
    "Audit logs",
    "Custom roles",
    "Real-time notifications",
    "Printer routing",
    "Manager approvals",
    "Low-stock alerts",
    "Waste tracking",
    "Profitability analytics",
    "Daily closing",
    "Business intelligence dashboard"
  ],

  "ai_optional_module": {
    "enabled": false,
    "future_features": [
      "Sales forecasting",
      "Demand forecasting",
      "Suggested purchasing",
      "Slow-moving item detection",
      "Menu profitability recommendations",
      "Peak hour prediction",
      "Inventory anomaly detection",
      "Customer behavior analysis",
      "Automated management summaries"
    ]
  },

  "integration_layer": {
    "optional_integrations": [
      "Stripe",
      "Paymob",
      "Fawry",
      "Vodafone Cash",
      "PayTabs",
      "WhatsApp Business",
      "SMS provider",
      "Google Maps",
      "Cloudinary",
      "Accounting software",
      "Food delivery marketplaces",
      "Thermal printers",
      "Barcode scanners",
      "Cash drawers"
    ],
    "architecture_rule": "Implement external integrations behind service interfaces so vendors can be replaced without rewriting business logic."
  },

  "notifications_rules": [
    {
      "event": "low_stock",
      "recipients": ["manager"]
    },
    {
      "event": "cash_variance",
      "recipients": ["manager"]
    },
    {
      "event": "new_delivery_order",
      "recipients": ["cashier", "kitchen"]
    },
    {
      "event": "kitchen_ready",
      "recipients": ["captain"]
    },
    {
      "event": "reservation_arriving",
      "recipients": ["manager", "captain"]
    }
  ],

  "business_rules": [
    "Cashier cannot change protected settings.",
    "Captain cannot view financial reports.",
    "Captain cannot issue refunds unless explicitly permitted.",
    "Only authorized users can apply high-value discounts.",
    "Only authorized users can delete or cancel orders after kitchen submission.",
    "Refunds must create an audit record.",
    "Deleted business records should preferably be soft-deleted where auditability matters.",
    "Orders must never be physically deleted after payment.",
    "Every payment must reference an order.",
    "Every order must have an order type.",
    "Dine-in orders should support table association.",
    "Tables cannot be occupied by conflicting active orders unless explicitly merged.",
    "Inventory changes must create stock movement records.",
    "Every shift must track opening and closing cash.",
    "User permission checks must happen on the backend.",
    "All monetary values must use decimal-safe database types.",
    "Use UTC internally and restaurant timezone for display.",
    "All important state transitions must be auditable."
  ],

  "testing": {
    "backend": [
      "Authentication tests",
      "Permission tests",
      "Order tests",
      "Payment tests",
      "Refund tests",
      "Inventory tests",
      "Stock deduction tests",
      "Table tests",
      "Shift tests",
      "Report tests",
      "Audit log tests"
    ],
    "frontend": [
      "POS workflow tests",
      "Table workflow tests",
      "Permission UI tests",
      "Order creation tests",
      "Payment UI tests",
      "Responsive tests"
    ],
    "e2e": [
      "Dine-in order from table to payment",
      "Takeaway order",
      "Delivery order",
      "Split payment",
      "Refund",
      "Table transfer",
      "Table merge",
      "Inventory deduction",
      "Shift open/close"
    ]
  },

  "seed_data": {
    "roles": [
      "Owner",
      "Manager",
      "Cashier",
      "Captain",
      "Kitchen",
      "Delivery"
    ],
    "categories": [
      "Pizza",
      "Burger",
      "Pasta",
      "Chicken",
      "Appetizers",
      "Salads",
      "Drinks",
      "Desserts"
    ],
    "pizza_subcategories": [
      "Ranch",
      "Barbecue",
      "Seafood",
      "Spicy",
      "Classic"
    ]
  },

  "documentation": {
    "required": [
      "README",
      "Architecture documentation",
      "Database ERD",
      "API documentation",
      "Permission matrix",
      "Setup guide",
      "Docker guide",
      "Deployment guide",
      "Environment variable documentation",
      "Testing guide",
      "Backup and restore guide",
      "User manual"
    ],
    "api_docs": "OpenAPI / Swagger"
  },

  "devops": {
    "requirements": [
      "Docker Compose",
      "Separate development and production configuration",
      "Environment variables",
      "PostgreSQL migration strategy",
      "Redis configuration",
      "Celery worker",
      "Celery beat",
      "Nginx",
      "HTTPS",
      "Health check endpoint",
      "Structured logging",
      "Error monitoring",
      "Automated backups",
      "CI/CD pipeline"
    ]
  },

  "backup_and_recovery": {
    "features": [
      "Automatic database backup",
      "Configurable backup schedule",
      "Backup retention",
      "Manual backup",
      "Restore procedure",
      "Media backup strategy"
    ]
  },

  "performance": {
    "requirements": [
      "Database indexing",
      "Pagination",
      "Selective API fields where useful",
      "Caching frequently accessed settings",
      "Optimized queries",
      "Avoid N+1 queries",
      "Lazy loading",
      "Image optimization",
      "WebSocket reconnection",
      "Efficient dashboard aggregations"
    ]
  },

  "responsive_design": {
    "desktop": "Manager and cashier workstation",
    "tablet": "Captain/waiter POS",
    "mobile": "Captain, delivery and selected management features",
    "minimum_supported": [
      "1280x720 desktop",
      "1024x768 tablet",
      "390x844 mobile"
    ]
  },

  "ui_design": {
    "style": "Premium modern restaurant POS",
    "primary_theme": "Black/dark professional interface with strong contrast and clean typography",
    "requirements": [
      "Modern dashboard cards",
      "Clear status badges",
      "Large touch-friendly buttons",
      "Elegant tables",
      "Fast POS interactions",
      "Consistent spacing",
      "Responsive layouts",
      "Accessible contrast",
      "Keyboard accessibility",
      "Loading states",
      "Empty states",
      "Error states",
      "Confirmation dialogs for destructive actions"
    ]
  },

  "implementation_phases": {
    "phase_1": [
      "Project setup",
      "Authentication",
      "Users",
      "Roles",
      "Permissions",
      "Restaurant settings"
    ],
    "phase_2": [
      "Categories",
      "Subcategories",
      "Menu items",
      "Variants",
      "Modifiers"
    ],
    "phase_3": [
      "Tables",
      "Floor plan",
      "Areas",
      "Table status"
    ],
    "phase_4": [
      "POS",
      "Dine-in",
      "Takeaway",
      "Order creation",
      "Order editing"
    ],
    "phase_5": [
      "Kitchen Display",
      "Real-time order flow"
    ],
    "phase_6": [
      "Payments",
      "Receipts",
      "Cash drawer",
      "Shifts"
    ],
    "phase_7": [
      "Delivery",
      "Drivers",
      "Delivery zones"
    ],
    "phase_8": [
      "Inventory",
      "Recipes",
      "Purchasing",
      "Suppliers",
      "Waste"
    ],
    "phase_9": [
      "Customers",
      "Reservations",
      "Loyalty"
    ],
    "phase_10": [
      "Reports",
      "Analytics",
      "Dashboard",
      "Exports"
    ],
    "phase_11": [
      "Audit logs",
      "Notifications",
      "Advanced permissions"
    ],
    "phase_12": [
      "Testing",
      "Docker",
      "CI/CD",
      "Production deployment",
      "Documentation"
    ]
  },

  "acceptance_criteria": {
    "must_have": [
      "Manager can access the complete management system.",
      "Manager can create cashiers.",
      "Manager can create captains.",
      "Manager can assign roles and permissions.",
      "Manager can create restaurant tables.",
      "Manager can set seating capacity for every table.",
      "Manager can organize tables into floors and areas.",
      "Captain can open a table.",
      "Captain can create an order for a table.",
      "Captain can add multiple products.",
      "Captain can add quantities and modifiers.",
      "Captain can send items to kitchen.",
      "Cashier can create dine-in orders.",
      "Cashier can create takeaway orders.",
      "Cashier can create delivery orders.",
      "Cashier can process payments.",
      "Orders can be split.",
      "Orders can be merged.",
      "Tables can be transferred.",
      "Kitchen receives orders in real time.",
      "Manager can see sales reports.",
      "Manager can see staff reports.",
      "Manager can see inventory reports.",
      "Manager can see payment reports.",
      "Manager can view audit logs.",
      "System supports categories and subcategories.",
      "System supports pizza -> ranch/barbecue/etc. hierarchy.",
      "System supports item variants and modifiers.",
      "System supports delivery management.",
      "System supports inventory and recipes.",
      "System supports refunds with permissions.",
      "System supports shift and cash drawer management."
    ]
  },

  "important_engineering_rules": [
    "Do not build only a UI prototype.",
    "Implement complete frontend and backend functionality.",
    "Use proper database relationships.",
    "Do not hardcode permissions in the frontend.",
    "Use backend authorization for every protected operation.",
    "Do not use floating point for money.",
    "Use UUIDs where appropriate.",
    "Use transactions for payment, refund, stock and order state operations.",
    "Prevent duplicate payments.",
    "Prevent race conditions when opening/locking tables.",
    "Make critical operations idempotent where appropriate.",
    "Use soft deletion for auditable business entities where appropriate.",
    "Provide pagination for large datasets.",
    "Use indexes for common search and reporting fields.",
    "Validate all API input.",
    "Return consistent API error responses.",
    "Add loading, success and error states to frontend operations.",
    "Keep domain/business logic separate from presentation code.",
    "Use reusable frontend components.",
    "Use service classes/modules for external integrations.",
    "Write automated tests for critical workflows.",
    "Generate Swagger/OpenAPI documentation.",
    "Provide realistic seed data.",
    "Make the entire system deployable with Docker.",
    "Provide environment variables example file.",
    "Never expose secrets in source code."
  ],

  "final_deliverables": [
    "Complete React frontend",
    "Complete Django backend",
    "PostgreSQL database schema",
    "REST API",
    "WebSocket real-time system",
    "Role and permission system",
    "Restaurant POS",
    "Table management",
    "Floor-plan system",
    "Menu management",
    "Order management",
    "Kitchen Display System",
    "Payment system",
    "Cash drawer and shifts",
    "Delivery management",
    "Inventory",
    "Recipe costing",
    "Purchasing",
    "Supplier management",
    "Customer management",
    "Reservations",
    "Discounts and promotions",
    "Loyalty",
    "Reports",
    "Audit logs",
    "Notifications",
    "Printing support",
    "Docker configuration",
    "CI/CD configuration",
    "Automated tests",
    "Swagger documentation",
    "README and deployment documentation"
  ],

  "ai_coding_instruction": {
    "role": "Act as a senior software architect, senior React engineer, senior Django engineer, database architect, DevOps engineer and QA engineer.",
    "instruction": "Build this project as a real production application, not a mockup. Start with architecture and database design, then implement backend APIs, authentication and authorization, followed by frontend pages and real integrations. Keep code modular and maintainable. Every feature must be connected end-to-end. Do not create fake buttons that do nothing. Do not leave core functionality as TODO placeholders.",
    "development_behavior": [
      "First analyze the entire specification.",
      "Create project structure.",
      "Create database schema and migrations.",
      "Implement authentication.",
      "Implement RBAC.",
      "Implement core models.",
      "Implement APIs.",
      "Implement business services.",
      "Implement frontend routes.",
      "Implement reusable UI components.",
      "Connect frontend to API.",
      "Implement WebSockets.",
      "Implement testing.",
      "Create seed data.",
      "Create Docker setup.",
      "Create documentation.",
      "Verify all acceptance criteria."
    ],
    "output_expectation": "Return complete source code organized by files, with exact file paths, environment configuration, setup commands, migrations, seed commands, test commands and deployment commands."
  }
}
```
