```json
{
  "project": {
    "name": "RestaurantOS Kitchen & Smart Printer Routing",
    "type": "Restaurant POS, Kitchen Display, Chef Station and Intelligent Printing System",
    "objective": "Extend the existing RestaurantOS system with a complete production-grade kitchen station, chef screen, printer routing and order ticket management system.",
    "important_instruction": "Do not rebuild existing POS, KDS, Tables, Orders, Menu, Delivery or RBAC modules. Extend and integrate with the existing architecture."
  },

  "existing_system_context": {
    "existing_features": [
      "POS Terminal",
      "Kitchen Display System",
      "Station routing",
      "Floor Plan",
      "Tables",
      "Orders",
      "Inventory",
      "Delivery",
      "Customer CRM",
      "Kiosk",
      "Reports",
      "Staff and RBAC",
      "Manager Settings",
      "Waiter Handheld POS"
    ],
    "existing_kitchen_stations": [
      "Grill",
      "Fryer",
      "Assembly",
      "Bar"
    ],
    "integration_rule": "Use the existing kitchen station and order architecture wherever possible."
  },

  "new_modules": [
    "Kitchen Command Center",
    "Chef Kitchen Screen",
    "Station Screen",
    "Printer Management",
    "Printer Routing",
    "Kitchen Ticket Management",
    "Kitchen Notes",
    "Order Modification Tracking",
    "Printer Monitoring",
    "Kitchen Performance"
  ],

  "kitchen_architecture": {
    "concept": "Every menu item belongs to a kitchen station. When an order is created, the system automatically routes each item to the correct station and printer.",
    "example": {
      "order": "Order #10520",
      "items": [
        {
          "item": "Chicken Ranch Pizza",
          "station": "Pizza"
        },
        {
          "item": "Double Beef Burger",
          "station": "Sandwich"
        },
        {
          "item": "French Fries",
          "station": "Fryer"
        },
        {
          "item": "Cola",
          "station": "Bar"
        }
      ],
      "routing": [
        "Pizza item -> Pizza Screen + Pizza Printer",
        "Burger item -> Sandwich Screen + Sandwich Printer",
        "Fries -> Fryer Screen + Fryer Printer",
        "Cola -> Bar Screen + Bar Printer",
        "Full order -> Cashier printer"
      ]
    }
  },

  "kitchen_stations": {
    "default_stations": [
      {
        "code": "PIZZA",
        "name_en": "Pizza",
        "name_ar": "بيتزا"
      },
      {
        "code": "SANDWICH",
        "name_en": "Sandwich",
        "name_ar": "ساندوتشات"
      },
      {
        "code": "GRILL",
        "name_en": "Grill",
        "name_ar": "جريل"
      },
      {
        "code": "FRYER",
        "name_en": "Fryer",
        "name_ar": "فراير"
      },
      {
        "code": "BAR",
        "name_en": "Bar",
        "name_ar": "مشروبات"
      },
      {
        "code": "DESSERT",
        "name_en": "Dessert",
        "name_ar": "حلويات"
      },
      {
        "code": "ASSEMBLY",
        "name_en": "Assembly",
        "name_ar": "تجهيز"
      }
    ],
    "manager_features": [
      "Create station",
      "Edit station",
      "Disable station",
      "Delete station",
      "Assign menu items",
      "Assign categories",
      "Assign printers",
      "Assign backup printer",
      "Assign screen",
      "Set preparation SLA",
      "Set priority rules"
    ]
  },

  "chef_screen": {
    "route": "/kitchen",
    "name_en": "Kitchen Command Center",
    "name_ar": "شاشة المطبخ",
    "purpose": "Provide kitchen staff with a fast visual interface for receiving, preparing and completing orders.",
    "features": [
      "Real-time orders",
      "Station filtering",
      "Order timers",
      "Item timers",
      "Priority orders",
      "New order sound",
      "Visual alerts",
      "Item completion",
      "Ticket completion",
      "Recall ticket",
      "Order notes",
      "Kitchen notes",
      "Customer notes when configured",
      "Table number",
      "Order number",
      "Order type",
      "Captain name",
      "Order creation time",
      "Estimated preparation time",
      "Delayed order warning"
    ]
  },

  "station_screen": {
    "route_pattern": "/kitchen/station/:stationCode",
    "examples": [
      "/kitchen/station/PIZZA",
      "/kitchen/station/SANDWICH",
      "/kitchen/station/GRILL",
      "/kitchen/station/FRYER",
      "/kitchen/station/BAR"
    ],
    "behavior": [
      "Only show items assigned to selected station.",
      "Do not show irrelevant products.",
      "Display the complete required context for each item.",
      "Support item-level completion.",
      "Support ticket-level completion.",
      "Real-time updates through WebSocket."
    ]
  },

  "pizza_station": {
    "screen": {
      "title_en": "Pizza Station",
      "title_ar": "قسم البيتزا"
    },
    "display": [
      "Order number",
      "Table number",
      "Order type",
      "Pizza name",
      "Size",
      "Quantity",
      "Modifiers",
      "Cooking instructions",
      "No/Extra ingredients",
      "Special notes",
      "Order age"
    ],
    "example": {
      "order": "#10520",
      "item": "Chicken Ranch Pizza",
      "size": "Large",
      "quantity": 2,
      "modifiers": [
        "Extra Cheese",
        "No Onion"
      ],
      "note": "Cut into 8 pieces",
      "status": "PREPARING"
    }
  },

  "sandwich_station": {
    "screen": {
      "title_en": "Sandwich Station",
      "title_ar": "قسم الساندوتشات"
    },
    "display": [
      "Order number",
      "Item name",
      "Quantity",
      "Bread type",
      "Size",
      "Sauce",
      "Add-ons",
      "Removed ingredients",
      "Cooking level",
      "Special notes"
    ]
  },

  "grill_station": {
    "screen": {
      "title_en": "Grill",
      "title_ar": "الجريل"
    },
    "display": [
      "Order number",
      "Item",
      "Quantity",
      "Cooking temperature",
      "Cooking instructions",
      "Modifiers",
      "Notes"
    ]
  },

  "fryer_station": {
    "screen": {
      "title_en": "Fryer",
      "title_ar": "الفراير"
    },
    "display": [
      "Order number",
      "Item",
      "Quantity",
      "Size",
      "Special instructions"
    ]
  },

  "bar_station": {
    "screen": {
      "title_en": "Bar",
      "title_ar": "المشروبات"
    },
    "display": [
      "Order number",
      "Drink",
      "Size",
      "Ice",
      "Sugar",
      "Add-ons",
      "Quantity",
      "Notes"
    ]
  },

  "kitchen_ticket": {
    "description": "Each kitchen station receives a station-specific ticket.",
    "fields": [
      "ticket_id",
      "order_id",
      "order_number",
      "station_id",
      "table_number",
      "order_type",
      "customer_name_if_allowed",
      "captain_name",
      "items",
      "notes",
      "priority",
      "created_at",
      "started_at",
      "ready_at",
      "status"
    ],
    "statuses": [
      "NEW",
      "ACCEPTED",
      "PREPARING",
      "READY",
      "SERVED",
      "CANCELLED",
      "RECALLED"
    ]
  },

  "notes_system": {
    "goal": "Ensure kitchen employees see the exact notes relevant to preparing the item.",
    "note_types": [
      {
        "code": "ITEM_NOTE",
        "name_en": "Item Note",
        "name_ar": "ملاحظة على الصنف"
      },
      {
        "code": "MODIFIER_NOTE",
        "name_en": "Modifier Note",
        "name_ar": "ملاحظة على الإضافات"
      },
      {
        "code": "KITCHEN_NOTE",
        "name_en": "Kitchen Note",
        "name_ar": "ملاحظة للمطبخ"
      },
      {
        "code": "DELIVERY_NOTE",
        "name_en": "Delivery Note",
        "name_ar": "ملاحظة للتوصيل"
      },
      {
        "code": "CUSTOMER_NOTE",
        "name_en": "Customer Note",
        "name_ar": "ملاحظة العميل"
      }
    ],
    "rules": [
      "Kitchen must only receive notes relevant to food preparation.",
      "Driver must receive delivery notes.",
      "Cashier can see all notes that their permission allows.",
      "Private internal notes must not be exposed to customers.",
      "Notes must remain attached to the correct order or item."
    ]
  },

  "item_customization": {
    "supported": [
      "Size",
      "Extra cheese",
      "Extra sauce",
      "No onion",
      "No tomato",
      "No pickles",
      "Spicy",
      "Extra spicy",
      "Cooking temperature",
      "Bread type",
      "Add-ons",
      "Remove ingredients",
      "Special instructions"
    ],
    "display_rule": "The kitchen must display modifications in a highly visible and easy-to-read format."
  },

  "printer_system": {
    "route": "/settings/printers",
    "goal": "Allow the manager to configure exactly where every part of an order is printed.",
    "printer_types": [
      "Cashier",
      "Kitchen",
      "Pizza",
      "Sandwich",
      "Grill",
      "Fryer",
      "Bar",
      "Dessert",
      "Assembly",
      "Delivery",
      "Receipt",
      "Invoice"
    ],
    "connection_types": [
      "Network",
      "USB",
      "Windows shared printer",
      "Bluetooth where supported",
      "Print server"
    ]
  },

  "printer_configuration": {
    "fields": [
      "printer_id",
      "name",
      "display_name",
      "printer_type",
      "station_id",
      "ip_address",
      "port",
      "connection_type",
      "paper_width",
      "active",
      "auto_print",
      "copies",
      "character_encoding",
      "print_header",
      "print_footer",
      "print_logo",
      "print_qr",
      "print_notes",
      "print_customer_name",
      "print_customer_phone",
      "print_address",
      "print_table_number",
      "print_captain",
      "print_order_type"
    ],
    "paper_widths": [
      "58mm",
      "80mm",
      "A4"
    ]
  },

  "printer_settings_screen": {
    "route": "/settings/printers",
    "features": [
      "Add printer",
      "Edit printer",
      "Delete printer",
      "Enable printer",
      "Disable printer",
      "Test print",
      "View status",
      "Set default printer",
      "Set backup printer",
      "Set number of copies",
      "Set paper size",
      "Configure header",
      "Configure footer",
      "Configure logo",
      "Configure order information",
      "Configure note visibility",
      "Configure language",
      "Configure auto-print"
    ]
  },

  "printer_routing": {
    "description": "Managers can define rules for where items print.",
    "routing_levels": [
      "Item",
      "Modifier",
      "Category",
      "Subcategory",
      "Kitchen Station",
      "Order Type",
      "Branch"
    ],
    "priority": [
      "Item-specific printer rule",
      "Category printer rule",
      "Station printer rule",
      "Branch default",
      "Restaurant default"
    ]
  },

  "routing_examples": [
    {
      "product": "Chicken Ranch Pizza",
      "category": "Pizza",
      "station": "PIZZA",
      "screen": "Pizza Screen",
      "printer": "Pizza Printer"
    },
    {
      "product": "Double Beef Burger",
      "category": "Burgers",
      "station": "SANDWICH",
      "screen": "Sandwich Screen",
      "printer": "Sandwich Printer"
    },
    {
      "product": "French Fries",
      "category": "Sides",
      "station": "FRYER",
      "screen": "Fryer Screen",
      "printer": "Fryer Printer"
    },
    {
      "product": "Cola",
      "category": "Drinks",
      "station": "BAR",
      "screen": "Bar Screen",
      "printer": "Bar Printer"
    }
  ],

  "order_print_flow": {
    "example": [
      "Cashier creates order",
      "Backend validates order",
      "Order is persisted",
      "Kitchen tickets are generated by station",
      "Pizza ticket is generated",
      "Sandwich ticket is generated",
      "Bar ticket is generated",
      "Cashier customer receipt is generated",
      "Printer routing engine selects printers",
      "Print jobs are queued",
      "Print jobs are sent to printers",
      "Kitchen screens receive real-time tickets",
      "Kitchen employees prepare items",
      "Station status updates",
      "Order progresses toward completion"
    ]
  },

  "cashier_printing": {
    "cashier_printer": {
      "print_documents": [
        "Customer Receipt",
        "Order Summary",
        "Payment Receipt",
        "Refund Receipt",
        "Duplicate Receipt"
      ]
    },
    "auto_print_rules": [
      "Print after successful payment",
      "Print after order confirmation",
      "Print delivery ticket if configured",
      "Print takeaway ticket if configured"
    ],
    "permissions": [
      "print_receipt",
      "reprint_receipt"
    ]
  },

  "kitchen_printing": {
    "rules": [
      "Kitchen printer prints only routed kitchen items.",
      "Do not print customer payment information unless configured.",
      "Print order number prominently.",
      "Print station name prominently.",
      "Print item quantity prominently.",
      "Print modifiers clearly.",
      "Print kitchen notes clearly.",
      "Print table number for dine-in orders.",
      "Print delivery/takeaway indicator.",
      "Print customer name where configured."
    ]
  },

  "kitchen_ticket_layout": {
    "header": [
      "Restaurant Name",
      "Order Number",
      "Station",
      "Order Type",
      "Table Number",
      "Captain"
    ],
    "body": [
      "Quantity",
      "Product",
      "Size",
      "Modifiers",
      "Item Notes"
    ],
    "footer": [
      "Kitchen Note",
      "Ticket Time",
      "Priority"
    ]
  },

  "sample_kitchen_ticket": {
    "language": "EN",
    "content": [
      "================================",
      "RESTAURANTOS",
      "PIZZA STATION",
      "================================",
      "ORDER #10520",
      "TABLE 12",
      "DINE IN",
      "CAPTAIN: MIKE",
      "--------------------------------",
      "2 x CHICKEN RANCH PIZZA",
      "SIZE: LARGE",
      "+ EXTRA CHEESE",
      "- ONION",
      "NOTE: CUT INTO 8",
      "--------------------------------",
      "PRIORITY: NORMAL",
      "TIME: 19:42",
      "================================"
    ]
  },

  "sample_kitchen_ticket_arabic": {
    "language": "AR",
    "content": [
      "================================",
      "RestaurantOS",
      "قسم البيتزا",
      "================================",
      "الطلب #10520",
      "الطاولة 12",
      "داخل المطعم",
      "الكابتن: مايكل",
      "--------------------------------",
      "2 × بيتزا دجاج رانش",
      "الحجم: كبير",
      "+ جبنة إضافية",
      "- بدون بصل",
      "ملاحظة: تقطيع 8 قطع",
      "--------------------------------",
      "الأولوية: عادية",
      "الوقت: 19:42",
      "================================"
    ]
  },

  "printer_queue": {
    "description": "Never block the POS request while waiting for a physical printer.",
    "architecture": [
      "POS creates order",
      "Backend creates print jobs",
      "Print jobs enter queue",
      "Background worker processes print jobs",
      "Printer service attempts delivery",
      "Status is recorded"
    ],
    "statuses": [
      "QUEUED",
      "PRINTING",
      "PRINTED",
      "FAILED",
      "RETRYING",
      "CANCELLED"
    ],
    "retry": {
      "enabled": true,
      "max_attempts": 3,
      "backoff": "exponential"
    }
  },

  "printer_failure_handling": {
    "scenario": "Pizza printer is offline.",
    "behavior": [
      "Do not fail the restaurant POS order.",
      "Mark print job as FAILED.",
      "Show printer alert.",
      "Attempt configured retries.",
      "Send to backup printer if configured.",
      "Show failed print job in manager printer dashboard.",
      "Allow manual reprint."
    ]
  },

  "backup_printer": {
    "enabled": true,
    "configuration": [
      "Primary Printer",
      "Backup Printer"
    ],
    "example": {
      "primary": "Pizza Printer 1",
      "backup": "Kitchen Printer 1"
    },
    "rule": "Backup should be used only according to configured failover rules."
  },

  "printer_test": {
    "feature": "Test Print",
    "output": [
      "RestaurantOS",
      "Printer Test",
      "Printer Name",
      "Station",
      "Connection",
      "Timestamp"
    ]
  },

  "printer_monitoring": {
    "dashboard": "/settings/printers/monitor",
    "show": [
      "Online",
      "Offline",
      "Printing",
      "Queue length",
      "Failed jobs",
      "Last successful print",
      "Last error",
      "Printer IP",
      "Station"
    ],
    "alerts": [
      "Printer offline",
      "Repeated print failure",
      "Large print queue",
      "No print activity during active kitchen orders"
    ]
  },

  "manual_reprint": {
    "allowed_for": [
      "Manager",
      "Authorized Cashier",
      "Authorized Kitchen Supervisor"
    ],
    "documents": [
      "Customer Receipt",
      "Kitchen Ticket",
      "Station Ticket",
      "Delivery Ticket"
    ],
    "rules": [
      "Every reprint is audited.",
      "Show REPRINT on duplicate kitchen tickets when configured.",
      "Do not silently create duplicate production tickets."
    ]
  },

  "order_modification_printing": {
    "scenario": "Customer adds another pizza after original order was sent to kitchen.",
    "behavior": [
      "Generate new incremental kitchen ticket.",
      "Do not reprint the entire old order unless configured.",
      "Clearly mark ticket as ADDITIONAL ORDER.",
      "Highlight newly added items."
    ],
    "example": {
      "title_en": "ADDITIONAL ORDER",
      "title_ar": "إضافة على الطلب"
    }
  },

  "order_cancellation_printing": {
    "scenario": "An item already sent to kitchen is cancelled.",
    "behavior": [
      "Generate cancellation ticket when configured.",
      "Clearly mark CANCELLED ITEM.",
      "Show item quantity.",
      "Show cancellation reason where permitted.",
      "Notify station screen.",
      "Audit the cancellation."
    ]
  },

  "course_management": {
    "enabled": true,
    "courses": [
      "Starter",
      "Main",
      "Dessert"
    ],
    "features": [
      "Send course separately",
      "Fire course",
      "Hold course",
      "Rush course",
      "Course-specific kitchen ticket"
    ]
  },

  "priority_system": {
    "priority_levels": [
      "NORMAL",
      "HIGH",
      "RUSH",
      "VIP"
    ],
    "display": [
      "Large visual badge",
      "Sound",
      "Timer emphasis"
    ],
    "permissions": [
      "Manager",
      "Captain with permission"
    ]
  },

  "kitchen_timer": {
    "track": [
      "Order age",
      "Station age",
      "Item preparation time",
      "Total kitchen time"
    ],
    "thresholds": {
      "normal": "< 10 minutes",
      "warning": "10-18 minutes",
      "critical": "> 18 minutes"
    },
    "rule": "Thresholds must be configurable in restaurant settings."
  },

  "chef_actions": {
    "available": [
      "Accept ticket",
      "Start preparation",
      "Mark item ready",
      "Mark ticket ready",
      "Recall ticket",
      "Pause ticket",
      "Add kitchen note",
      "Mark unavailable",
      "Report problem"
    ]
  },

  "chef_permissions": {
    "permissions": [
      "kitchen.view",
      "kitchen.accept",
      "kitchen.start",
      "kitchen.ready",
      "kitchen.recall",
      "kitchen.notes",
      "kitchen.mark_item_unavailable",
      "kitchen.view_customer_notes_limited"
    ]
  },

  "item_station_mapping": {
    "manager_can_configure": true,
    "mapping_levels": [
      "Product",
      "Category",
      "Subcategory"
    ],
    "example": {
      "category": "Pizza",
      "station": "PIZZA",
      "printer": "Pizza Printer"
    }
  },

  "modifier_station_mapping": {
    "enabled": true,
    "description": "Modifiers may influence which station receives the ticket where required.",
    "example": {
      "modifier": "Extra Grilled Chicken",
      "station": "GRILL"
    }
  },

  "multi_station_order": {
    "example": "One customer order contains pizza, burger, fries and drinks.",
    "expected_behavior": [
      "Generate Pizza station ticket.",
      "Generate Sandwich station ticket.",
      "Generate Fryer station ticket.",
      "Generate Bar station ticket.",
      "Track each independently.",
      "Aggregate completion status at order level."
    ]
  },

  "synchronization": {
    "goal": "Prevent the kitchen from serving incomplete orders or losing station state.",
    "logic": [
      "Each station ticket has independent state.",
      "Order tracks all station ticket states.",
      "Manager can view partially ready orders.",
      "Captain can receive ready notifications.",
      "System can calculate when the full order is ready."
    ]
  },

  "order_ready_logic": {
    "complete_when": [
      "All required station items are READY"
    ],
    "optional": [
      "Assembly station confirms final assembly."
    ],
    "notification": [
      "Captain",
      "Cashier where configured"
    ]
  },

  "kitchen_assembly_screen": {
    "purpose": "Final station that combines products from multiple stations.",
    "features": [
      "Show partially ready order",
      "Show missing items",
      "Show ready items",
      "Confirm complete order",
      "Mark handed to captain",
      "Mark packed for delivery"
    ]
  },

  "delivery_kitchen_flow": {
    "rules": [
      "Delivery order must show DELIVERY clearly.",
      "Customer name may be shown where configured.",
      "Delivery address should only be shown where appropriate.",
      "Kitchen should receive food preparation information, not unnecessary customer data.",
      "Packing/assembly station receives order when all items are ready.",
      "Driver dispatch should happen only after order is ready."
    ]
  },

  "takeaway_flow": {
    "rules": [
      "Takeaway orders show TAKEAWAY prominently.",
      "Print takeaway ticket if enabled.",
      "Do not assign dining table.",
      "Show customer name/order number."
    ]
  },

  "dine_in_flow": {
    "rules": [
      "Print table number.",
      "Print captain.",
      "Print guest count where configured.",
      "Route food to stations.",
      "Captain receives ready notification."
    ]
  },

  "printer_languages": {
    "supported": [
      "English",
      "Arabic",
      "Bilingual"
    ],
    "behavior": [
      "Printer language can follow user language.",
      "Printer can have a fixed language.",
      "Bilingual ticket can show English and Arabic together.",
      "Arabic printer output must support RTL-capable rendering where applicable."
    ]
  },

  "database_models": {
    "new_entities": [
      "KitchenStation",
      "KitchenStationTranslation",
      "KitchenScreen",
      "KitchenTicket",
      "KitchenTicketItem",
      "KitchenNote",
      "Printer",
      "PrinterRoute",
      "PrinterRule",
      "PrintJob",
      "PrintAttempt",
      "PrinterBackup",
      "KitchenEvent",
      "KitchenPerformanceSnapshot"
    ],
    "relationships": [
      "KitchenStation has many MenuItems",
      "KitchenStation has many Printers",
      "KitchenStation has many KitchenScreens",
      "Order has many KitchenTickets",
      "KitchenTicket belongs to one Station",
      "KitchenTicket has many KitchenTicketItems",
      "Printer belongs to one Station optionally",
      "Printer has many PrintJobs",
      "PrintJob references one Order or KitchenTicket",
      "Printer may have one backup Printer"
    ]
  },

  "printer_model": {
    "fields": [
      "id",
      "name",
      "station_id",
      "type",
      "connection_type",
      "ip_address",
      "port",
      "paper_width",
      "active",
      "auto_print",
      "copies",
      "language",
      "print_logo",
      "print_header",
      "print_footer",
      "print_notes",
      "backup_printer_id",
      "last_seen_at",
      "last_error",
      "created_at",
      "updated_at"
    ]
  },

  "print_job_model": {
    "fields": [
      "id",
      "printer_id",
      "order_id",
      "kitchen_ticket_id",
      "document_type",
      "status",
      "attempt_count",
      "payload",
      "error_message",
      "queued_at",
      "printed_at",
      "created_at"
    ],
    "document_types": [
      "CUSTOMER_RECEIPT",
      "KITCHEN_TICKET",
      "STATION_TICKET",
      "DELIVERY_TICKET",
      "TAKEAWAY_TICKET",
      "REFUND_RECEIPT",
      "CANCELLATION_TICKET",
      "ADDITION_TICKET"
    ]
  },

  "api": {
    "endpoints": [
      {
        "method": "GET",
        "path": "/api/kitchen/stations/",
        "purpose": "List kitchen stations"
      },
      {
        "method": "POST",
        "path": "/api/kitchen/stations/",
        "purpose": "Create station"
      },
      {
        "method": "PATCH",
        "path": "/api/kitchen/stations/{id}/",
        "purpose": "Update station"
      },
      {
        "method": "GET",
        "path": "/api/kitchen/tickets/",
        "purpose": "Get kitchen tickets"
      },
      {
        "method": "POST",
        "path": "/api/kitchen/tickets/{id}/accept/",
        "purpose": "Accept ticket"
      },
      {
        "method": "POST",
        "path": "/api/kitchen/tickets/{id}/start/",
        "purpose": "Start ticket"
      },
      {
        "method": "POST",
        "path": "/api/kitchen/tickets/{id}/ready/",
        "purpose": "Mark ready"
      },
      {
        "method": "POST",
        "path": "/api/kitchen/tickets/{id}/recall/",
        "purpose": "Recall ticket"
      },
      {
        "method": "GET",
        "path": "/api/printers/",
        "purpose": "List printers"
      },
      {
        "method": "POST",
        "path": "/api/printers/",
        "purpose": "Create printer"
      },
      {
        "method": "PATCH",
        "path": "/api/printers/{id}/",
        "purpose": "Update printer"
      },
      {
        "method": "POST",
        "path": "/api/printers/{id}/test-print/",
        "purpose": "Run printer test"
      },
      {
        "method": "GET",
        "path": "/api/printers/{id}/status/",
        "purpose": "Printer status"
      },
      {
        "method": "GET",
        "path": "/api/print-jobs/",
        "purpose": "List print jobs"
      },
      {
        "method": "POST",
        "path": "/api/print-jobs/{id}/retry/",
        "purpose": "Retry failed print"
      },
      {
        "method": "POST",
        "path": "/api/print-jobs/{id}/reprint/",
        "purpose": "Manually reprint"
      }
    ]
  },

  "websocket_events": [
    "KITCHEN_TICKET_CREATED",
    "KITCHEN_TICKET_UPDATED",
    "KITCHEN_ITEM_READY",
    "KITCHEN_ORDER_READY",
    "KITCHEN_TICKET_RECALLED",
    "ORDER_ITEM_ADDED",
    "ORDER_ITEM_CANCELLED",
    "ORDER_NOTE_UPDATED",
    "PRINTER_STATUS_CHANGED",
    "PRINT_JOB_FAILED",
    "PRINT_JOB_COMPLETED",
    "DELIVERY_READY"
  ],

  "frontend_pages": {
    "manager": [
      "/kitchen",
      "/kitchen/stations",
      "/kitchen/screens",
      "/settings/printers",
      "/settings/printers/routing",
      "/settings/printers/monitor",
      "/reports/kitchen"
    ],
    "chef": [
      "/kitchen",
      "/kitchen/station/:stationCode"
    ],
    "cashier": [
      "/pos",
      "/orders",
      "/printers/reprint"
    ]
  },

  "printer_routing_ui": {
    "page": "/settings/printers/routing",
    "features": [
      "Select station",
      "Select category",
      "Select item",
      "Select primary printer",
      "Select backup printer",
      "Enable auto print",
      "Set copies",
      "Preview ticket",
      "Save routing rule"
    ],
    "example_ui": {
      "category": "Pizza",
      "station": "Pizza",
      "primary_printer": "Pizza Printer",
      "backup_printer": "Main Kitchen Printer",
      "copies": 1,
      "auto_print": true
    }
  },

  "manager_permissions": {
    "permissions": [
      "kitchen.settings",
      "kitchen.station.create",
      "kitchen.station.edit",
      "kitchen.station.delete",
      "kitchen.routing.manage",
      "printer.view",
      "printer.create",
      "printer.edit",
      "printer.delete",
      "printer.test",
      "printer.reprint",
      "printer.retry",
      "printer.configure",
      "kitchen.analytics.view"
    ]
  },

  "printer_permissions": {
    "rules": [
      "Cashier can print/reprint customer receipt according to permission.",
      "Chef can reprint kitchen ticket only if authorized.",
      "Manager can reprint everything.",
      "Driver cannot access kitchen printer management.",
      "Kitchen staff cannot change printer configuration unless explicitly authorized."
    ]
  },

  "kitchen_analytics": {
    "metrics": [
      "Average preparation time",
      "Average ticket time",
      "Tickets per station",
      "Delayed tickets",
      "Items per hour",
      "Station utilization",
      "Recalled tickets",
      "Cancelled kitchen items",
      "Remakes",
      "Printer failures",
      "Print queue delay"
    ]
  },

  "printer_analytics": {
    "metrics": [
      "Print jobs",
      "Successful prints",
      "Failed prints",
      "Retry count",
      "Average print delay",
      "Printer uptime",
      "Most problematic printer"
    ]
  },

  "audit_logging": {
    "events": [
      "Printer created",
      "Printer updated",
      "Printer deleted",
      "Routing changed",
      "Manual reprint",
      "Print retry",
      "Kitchen ticket recalled",
      "Kitchen item cancelled",
      "Kitchen note changed",
      "Station configuration changed"
    ]
  },

  "security": {
    "rules": [
      "Never allow frontend-only printer permissions.",
      "Backend must authorize printer operations.",
      "Printer configuration must be protected.",
      "Do not expose printer credentials publicly.",
      "Do not expose customer data unnecessarily on kitchen screens.",
      "Do not expose payment information to kitchen users unless required.",
      "Validate print job ownership and permissions.",
      "Prevent unauthorized reprinting."
    ]
  },

  "reliability": {
    "requirements": [
      "POS order creation must not fail because a printer is offline.",
      "Print jobs must be persisted.",
      "Printer failures must be visible.",
      "Retry must be supported.",
      "Backup printer must be supported.",
      "Duplicate print protection must exist.",
      "Reprint must be explicit.",
      "Kitchen state must be recoverable after browser refresh.",
      "WebSocket reconnect must recover current state."
    ]
  },

  "offline_behavior": {
    "kitchen_screen": [
      "Show last synchronized tickets.",
      "Clearly display offline status.",
      "Do not falsely report new server-side orders when disconnected.",
      "Resynchronize after reconnect."
    ],
    "printer": [
      "Queue jobs when supported.",
      "Never silently lose print requests.",
      "Mark unresolved jobs clearly."
    ]
  },

  "testing": {
    "unit_tests": [
      "Station routing",
      "Printer routing",
      "Backup printer selection",
      "Print job creation",
      "Print retry",
      "Print failure",
      "Kitchen ticket creation",
      "Item modification",
      "Item cancellation",
      "Kitchen status transition"
    ],
    "integration_tests": [
      "Pizza item routes to pizza printer",
      "Burger item routes to sandwich printer",
      "Drink routes to bar printer",
      "One order creates multiple station tickets",
      "Cashier receipt prints correctly",
      "Printer failure does not fail order creation",
      "Backup printer receives failed job",
      "Reprint requires authorization",
      "Additional item creates additional ticket",
      "Cancelled item generates cancellation ticket"
    ],
    "e2e_tests": [
      "Create dine-in order",
      "Route pizza to Pizza Station",
      "Route burger to Sandwich Station",
      "Route drink to Bar",
      "Complete all stations",
      "Assembly marks full order ready",
      "Captain receives notification"
    ]
  },

  "multilingual": {
    "languages": [
      "English",
      "Arabic"
    ],
    "requirements": [
      "Kitchen screen supports English and Arabic.",
      "Station names support English and Arabic.",
      "Printer tickets support English and Arabic.",
      "Notes can contain Arabic or English.",
      "Language can be selected per user.",
      "Arabic UI uses RTL.",
      "Physical kitchen layout is not mirrored because of RTL.",
      "Product translations use existing multilingual menu architecture."
    ]
  },

  "recommended_physical_setup": {
    "example": {
      "cashier": {
        "screen": "POS",
        "printer": "Cashier Receipt Printer"
      },
      "pizza": {
        "screen": "Pizza Kitchen Screen",
        "printer": "Pizza Printer"
      },
      "sandwich": {
        "screen": "Sandwich Kitchen Screen",
        "printer": "Sandwich Printer"
      },
      "grill": {
        "screen": "Grill Screen",
        "printer": "Grill Printer"
      },
      "fryer": {
        "screen": "Fryer Screen",
        "printer": "Fryer Printer"
      },
      "bar": {
        "screen": "Bar Screen",
        "printer": "Bar Printer"
      },
      "assembly": {
        "screen": "Assembly Screen",
        "printer": "Assembly Printer"
      }
    }
  },

  "advanced_future_features": [
    "Kitchen video wall mode",
    "Expo screen",
    "Voice announcement for priority orders",
    "Kitchen capacity monitoring",
    "Automatic station load balancing",
    "Printer auto-discovery",
    "Central print server",
    "Cloud printer monitoring",
    "Kitchen SLA alerts",
    "AI kitchen demand prediction",
    "AI preparation time prediction",
    "Automatic staffing recommendations"
  ],

  "implementation_order": [
    "Create Kitchen Station models",
    "Create Kitchen Ticket models",
    "Create Printer models",
    "Create Printer Routing models",
    "Create Print Job queue",
    "Implement station mapping",
    "Implement automatic ticket generation",
    "Implement WebSocket events",
    "Build Kitchen Command Center",
    "Build station-specific screens",
    "Build printer settings",
    "Build routing settings",
    "Build printer monitoring",
    "Build reprint system",
    "Build cancellation/addition tickets",
    "Build kitchen analytics",
    "Implement tests",
    "Implement multilingual support",
    "Integrate with existing POS",
    "Integrate with existing Order model",
    "Integrate with existing Menu model",
    "Integrate with existing RBAC"
  ],

  "critical_business_rules": [
    "A single order may create multiple kitchen tickets.",
    "Each item must route to the correct station.",
    "Each station may have a different printer.",
    "Each station may have a different screen.",
    "A printer failure must not cancel a valid order.",
    "Every print job must have a persistent status.",
    "Manual reprints must be auditable.",
    "Additional items should generate incremental kitchen tickets.",
    "Cancelled kitchen items should generate cancellation notifications where configured.",
    "Kitchen notes must be clearly visible.",
    "Delivery notes must not replace kitchen notes.",
    "Customer private notes must not automatically be shown to all staff.",
    "Price/payment information should not appear on kitchen tickets unless configured.",
    "Sensitive operations require permission.",
    "All station state transitions must be server validated.",
    "All money-related functionality remains in the existing financial architecture.",
    "Use database transactions for critical order/ticket creation.",
    "Use background jobs for physical printing.",
    "Do not block POS requests waiting for printers."
  ],

  "final_acceptance_criteria": [
    "Manager can create kitchen stations.",
    "Manager can assign products to stations.",
    "Manager can configure printers.",
    "Manager can assign printers to stations.",
    "Manager can configure backup printers.",
    "Manager can configure auto-print.",
    "Manager can select paper size.",
    "Manager can configure copies.",
    "Manager can test printers.",
    "Manager can monitor printers.",
    "Cashier receives customer receipt.",
    "Pizza order prints only at Pizza station.",
    "Sandwich order prints only at Sandwich station.",
    "Fryer items print only at Fryer station.",
    "Drinks print only at Bar station.",
    "Kitchen screens receive orders in real time.",
    "Chef can accept orders.",
    "Chef can start orders.",
    "Chef can mark items ready.",
    "Chef can mark ticket ready.",
    "Chef can recall tickets.",
    "Kitchen sees item modifiers.",
    "Kitchen sees item notes.",
    "Kitchen sees relevant special instructions.",
    "Additional order items generate an additional ticket.",
    "Cancelled items can generate cancellation tickets.",
    "Printer failure does not cancel POS order.",
    "Failed print jobs can be retried.",
    "Backup printer can be used.",
    "Manual reprints are permission controlled.",
    "All reprints are audited.",
    "Arabic and English are supported.",
    "RTL works correctly.",
    "Physical kitchen layout does not change due to RTL.",
    "Kitchen analytics are available.",
    "Printer analytics are available.",
    "The entire feature integrates with existing RestaurantOS modules."
  ],

  "final_engineering_instruction": {
    "role": "Senior production software engineer and restaurant technology architect",
    "instruction": "Build a complete production-ready kitchen and printer routing system integrated with the existing RestaurantOS codebase.",
    "do_not": [
      "Do not create fake printer functionality.",
      "Do not use frontend-only printer routing.",
      "Do not block POS while waiting for printers.",
      "Do not create duplicate order systems.",
      "Do not hardcode stations.",
      "Do not hardcode printer IP addresses.",
      "Do not expose sensitive customer data unnecessarily.",
      "Do not create buttons with no functionality.",
      "Do not use pseudocode for core functionality."
    ],
    "required_for_each_feature": [
      "Database",
      "Migration",
      "Backend model",
      "Serializer",
      "Service",
      "API",
      "Permission",
      "Frontend page",
      "Frontend components",
      "WebSocket integration",
      "Error handling",
      "Audit logging where necessary",
      "Tests",
      "Documentation"
    ],
    "required_output": [
      "Architecture changes",
      "Database ERD updates",
      "New models",
      "API catalog",
      "Printer architecture",
      "Kitchen architecture",
      "Frontend structure",
      "Complete implementation",
      "Test suite",
      "Environment configuration",
      "Deployment documentation"
    ]
  }
}
```
