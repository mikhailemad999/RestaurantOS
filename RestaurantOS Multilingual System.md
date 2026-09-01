```json
{
  "project": {
    "name": "RestaurantOS Multilingual System",
    "feature": "English + Arabic Localization and Per-User Language Preferences",
    "objective": "Add a complete production-grade multilingual system to the existing RestaurantOS application so every user can independently select Arabic or English.",
    "supported_languages": [
      {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "direction": "ltr"
      },
      {
        "code": "ar",
        "name": "Arabic",
        "native_name": "العربية",
        "direction": "rtl"
      }
    ]
  },

  "important_existing_system": {
    "instruction": "Do not rebuild or destroy the existing RestaurantOS modules. Extend them.",
    "existing_modules": [
      "POS Terminal",
      "Kitchen Display System",
      "Floor Plan and Tables",
      "Menu and Recipe Costing",
      "Inventory",
      "Delivery Dispatch",
      "Driver App",
      "Customer CRM",
      "Kiosk",
      "Executive BI",
      "Financial Reports",
      "Manager Mobile",
      "Waiter Handheld POS",
      "Staff and RBAC",
      "Global Settings",
      "PIN Login"
    ],
    "integration_rule": "The multilingual system must work across all existing and future modules."
  },

  "core_requirement": {
    "description": "Every individual user has their own language preference.",
    "behavior": [
      "User A can use Arabic.",
      "User B can use English.",
      "Both can be logged into the same restaurant at the same time.",
      "Changing one user's language must not change another user's language.",
      "Language preference must persist after logout and login.",
      "Language preference must persist across devices when the user account is used.",
      "User language overrides restaurant default language.",
      "Restaurant default language is used only when a user has not explicitly selected a language."
    ]
  },

  "language_levels": {
    "system_default": {
      "description": "Default language configured by restaurant manager.",
      "allowed": [
        "en",
        "ar"
      ]
    },
    "user_preference": {
      "description": "Each user can select their own language.",
      "allowed": [
        "en",
        "ar"
      ]
    },
    "public_customer_language": {
      "description": "Customer-facing interfaces can independently select language.",
      "supported": [
        "en",
        "ar"
      ]
    },
    "future": {
      "architecture_should_support": [
        "fr",
        "de",
        "es",
        "it",
        "tr"
      ],
      "rule": "Do not hardcode architecture to only two languages even though only English and Arabic are required initially."
    }
  },

  "user_language_settings": {
    "fields": [
      {
        "name": "preferred_language",
        "type": "enum",
        "values": [
          "en",
          "ar"
        ]
      },
      {
        "name": "preferred_direction",
        "type": "computed",
        "values": [
          "ltr",
          "rtl"
        ]
      },
      {
        "name": "locale",
        "type": "string",
        "examples": [
          "en-US",
          "ar-EG"
        ]
      }
    ],
    "database_behavior": [
      "Store preferred_language on user/staff profile.",
      "Do not store translated UI labels in user profile.",
      "Store content translations separately where required."
    ]
  },

  "language_selector": {
    "locations": [
      "Login page",
      "Top navigation",
      "User profile",
      "Settings",
      "Manager settings",
      "Mobile menu",
      "Kiosk",
      "Public online ordering"
    ],
    "ui": {
      "english": {
        "label": "English"
      },
      "arabic": {
        "label": "العربية"
      }
    },
    "behavior": [
      "Instantly switch interface language.",
      "Persist selection.",
      "Update direction automatically.",
      "Do not require full application rebuild.",
      "Do not log the user out."
    ]
  },

  "rtl_support": {
    "enabled": true,
    "requirements": [
      "Use CSS logical properties whenever possible.",
      "Use margin-inline instead of margin-left/margin-right.",
      "Use padding-inline instead of padding-left/padding-right.",
      "Use inset-inline-start/inset-inline-end.",
      "Support direction switching at application root.",
      "Mirror navigation layouts appropriately.",
      "Mirror sidebars where appropriate.",
      "Mirror forms where appropriate.",
      "Mirror table action placement where appropriate.",
      "Mirror POS layout when appropriate.",
      "Do not incorrectly mirror icons whose meaning is universal.",
      "Do not mirror numbers.",
      "Do not mirror product images.",
      "Do not reverse phone numbers.",
      "Do not reverse order numbers.",
      "Do not reverse currency symbols incorrectly.",
      "Ensure RTL does not break charts or data tables."
    ]
  },

  "frontend_architecture": {
    "technology": "React internationalization architecture",
    "recommended_library": "react-i18next / i18next",
    "requirements": [
      "Central translation provider.",
      "Lazy-load translation resources.",
      "Namespace translations by module.",
      "Avoid hardcoded UI strings.",
      "Use translation keys for every visible UI label.",
      "Support interpolation.",
      "Support pluralization.",
      "Support date formatting.",
      "Support number formatting.",
      "Support currency formatting.",
      "Support RTL/LTR switching."
    ],
    "translation_namespaces": [
      "common",
      "auth",
      "dashboard",
      "pos",
      "orders",
      "tables",
      "menu",
      "kitchen",
      "inventory",
      "delivery",
      "customers",
      "reservations",
      "marketing",
      "staff",
      "reports",
      "settings",
      "notifications",
      "errors",
      "validation",
      "approvals",
      "analytics",
      "owner",
      "kiosk"
    ]
  },

  "translation_file_structure": {
    "example": {
      "frontend": {
        "src": {
          "i18n": {
            "index.js": "i18n initialization",
            "config.js": "language configuration",
            "locales": {
              "en": {
                "common.json": "English common translations",
                "pos.json": "English POS translations",
                "orders.json": "English order translations",
                "delivery.json": "English delivery translations",
                "customers.json": "English customer translations",
                "dashboard.json": "English dashboard translations",
                "settings.json": "English settings translations",
                "errors.json": "English error translations"
              },
              "ar": {
                "common.json": "Arabic common translations",
                "pos.json": "Arabic POS translations",
                "orders.json": "Arabic order translations",
                "delivery.json": "Arabic delivery translations",
                "customers.json": "Arabic customer translations",
                "dashboard.json": "Arabic dashboard translations",
                "settings.json": "Arabic settings translations",
                "errors.json": "Arabic error translations"
              }
            }
          }
        }
      }
    }
  },

  "translation_rules": {
    "mandatory": [
      "Every user-facing string must have an English translation.",
      "Every user-facing string must have an Arabic translation.",
      "Never hardcode English strings directly inside React components.",
      "Never hardcode Arabic strings directly inside React components.",
      "Translation keys must be semantic and descriptive.",
      "Keep translation keys stable.",
      "Do not use English text itself as translation key.",
      "Do not dynamically generate translation keys from user input."
    ],
    "examples": {
      "correct": "t('pos.checkout')",
      "incorrect": "'Checkout'",
      "arabic": "تسجيل الخروج"
    }
  },

  "common_translation_examples": {
    "en": {
      "app_name": "RestaurantOS",
      "dashboard": "Dashboard",
      "pos": "POS",
      "orders": "Orders",
      "tables": "Tables",
      "menu": "Menu",
      "inventory": "Inventory",
      "delivery": "Delivery",
      "customers": "Customers",
      "reports": "Reports",
      "settings": "Settings",
      "staff": "Staff",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "search": "Search",
      "add": "Add",
      "close": "Close",
      "confirm": "Confirm",
      "back": "Back",
      "next": "Next",
      "loading": "Loading...",
      "success": "Success",
      "error": "Error",
      "warning": "Warning"
    },
    "ar": {
      "app_name": "RestaurantOS",
      "dashboard": "لوحة التحكم",
      "pos": "نقطة البيع",
      "orders": "الطلبات",
      "tables": "الطاولات",
      "menu": "القائمة",
      "inventory": "المخزون",
      "delivery": "التوصيل",
      "customers": "العملاء",
      "reports": "التقارير",
      "settings": "الإعدادات",
      "staff": "الموظفون",
      "save": "حفظ",
      "cancel": "إلغاء",
      "delete": "حذف",
      "edit": "تعديل",
      "search": "بحث",
      "add": "إضافة",
      "close": "إغلاق",
      "confirm": "تأكيد",
      "back": "رجوع",
      "next": "التالي",
      "loading": "جارٍ التحميل...",
      "success": "تم بنجاح",
      "error": "حدث خطأ",
      "warning": "تحذير"
    }
  },

  "pos_localization": {
    "requirements": [
      "POS must fully support Arabic.",
      "POS must fully support English.",
      "Category names must support translations.",
      "Subcategory names must support translations.",
      "Product names must support translations.",
      "Product descriptions must support translations.",
      "Modifier names must support translations.",
      "Modifier descriptions must support translations.",
      "Order status labels must support translations.",
      "Payment methods must support translations.",
      "Discount names must support translations.",
      "Validation messages must support translations."
    ]
  },

  "menu_translation_model": {
    "important_rule": "Menu data is business content, not only UI translation.",
    "recommended_structure": {
      "MenuItem": {
        "id": "UUID",
        "sku": "string",
        "price": "decimal",
        "active": "boolean"
      },
      "MenuItemTranslation": {
        "id": "UUID",
        "menu_item_id": "UUID",
        "language": "en|ar",
        "name": "string",
        "description": "text"
      },
      "CategoryTranslation": {
        "id": "UUID",
        "category_id": "UUID",
        "language": "en|ar",
        "name": "string",
        "description": "text"
      },
      "ModifierTranslation": {
        "id": "UUID",
        "modifier_id": "UUID",
        "language": "en|ar",
        "name": "string",
        "description": "text"
      }
    }
  },

  "menu_admin": {
    "requirements": [
      "Manager can enter English item name.",
      "Manager can enter Arabic item name.",
      "Manager can enter English description.",
      "Manager can enter Arabic description.",
      "Manager can see translation completion status.",
      "Manager can filter items by missing translation.",
      "Manager can warn when Arabic translation is missing.",
      "Manager can warn when English translation is missing."
    ],
    "translation_status": [
      "complete",
      "english_missing",
      "arabic_missing"
    ]
  },

  "customer_data": {
    "rule": "Customer personal data itself should NOT be automatically translated.",
    "examples": [
      "Customer name remains exactly as entered.",
      "Phone number remains unchanged.",
      "Address remains stored as entered.",
      "Customer notes remain stored as entered unless translation is explicitly requested.",
      "Order numbers remain unchanged."
    ],
    "ui_translation": "Labels surrounding customer data must be translated."
  },

  "address_localization": {
    "fields": [
      "city",
      "area",
      "street",
      "building",
      "floor",
      "apartment",
      "landmark",
      "delivery_instructions"
    ],
    "rule": "Do not automatically translate customer-provided addresses because translation may corrupt real delivery information.",
    "optional_feature": "Allow separate Arabic and English address display fields for restaurants operating bilingually."
  },

  "reports_localization": {
    "requirements": [
      "Reports must render in Arabic.",
      "Reports must render in English.",
      "PDF reports must support Arabic fonts.",
      "Excel exports must support Arabic.",
      "CSV exports must use UTF-8.",
      "Column names must be translated based on user language.",
      "Charts must display localized labels.",
      "Date formats must be localized.",
      "Number formats must be localized."
    ]
  },

  "date_and_time_localization": {
    "requirements": [
      "Use locale-aware formatting.",
      "Respect restaurant timezone.",
      "Respect user language.",
      "Support Arabic month names.",
      "Support English month names.",
      "Use localized relative time where appropriate.",
      "Store timestamps consistently in backend."
    ],
    "examples": {
      "en": "September 2, 2026",
      "ar": "2 سبتمبر 2026"
    }
  },

  "number_localization": {
    "requirements": [
      "Format numbers according to selected locale.",
      "Do not alter database numeric values.",
      "Do not alter order IDs.",
      "Do not alter phone numbers.",
      "Do not alter SKU values."
    ],
    "examples": {
      "en": "1,250.50",
      "ar": "١٬٢٥٠٫٥٠"
    },
    "configurable": true
  },

  "currency_localization": {
    "requirements": [
      "Currency should come from restaurant configuration.",
      "Currency is independent from UI language.",
      "Arabic UI can display EGP.",
      "English UI can display EGP.",
      "Do not convert currencies merely because language changes."
    ],
    "example": {
      "english": "450 EGP",
      "arabic": "٤٥٠ جنيه مصري"
    }
  },

  "order_status_translation": {
    "en": {
      "draft": "Draft",
      "confirmed": "Confirmed",
      "sent_to_kitchen": "Sent to Kitchen",
      "preparing": "Preparing",
      "ready": "Ready",
      "served": "Served",
      "completed": "Completed",
      "cancelled": "Cancelled",
      "refunded": "Refunded"
    },
    "ar": {
      "draft": "مسودة",
      "confirmed": "مؤكد",
      "sent_to_kitchen": "تم الإرسال إلى المطبخ",
      "preparing": "قيد التحضير",
      "ready": "جاهز",
      "served": "تم التقديم",
      "completed": "مكتمل",
      "cancelled": "ملغي",
      "refunded": "تم رد المبلغ"
    }
  },

  "delivery_translation": {
    "required_sections": [
      "Customer",
      "Phone",
      "Address",
      "Delivery Note",
      "Driver",
      "Delivery Fee",
      "Payment",
      "Status",
      "Estimated Time"
    ],
    "rule": "All delivery workflow labels must support English and Arabic."
  },

  "kitchen_translation": {
    "requirements": [
      "KDS must support Arabic.",
      "KDS must support English.",
      "Kitchen station names support translation.",
      "Status names support translation.",
      "Preparation messages support translation.",
      "Priority labels support translation."
    ],
    "example": {
      "en": {
        "new": "New",
        "preparing": "Preparing",
        "ready": "Ready",
        "priority": "Priority"
      },
      "ar": {
        "new": "جديد",
        "preparing": "قيد التحضير",
        "ready": "جاهز",
        "priority": "أولوية"
      }
    }
  },

  "notifications": {
    "requirements": [
      "Notifications must respect recipient language.",
      "Manager may receive Arabic notification.",
      "Cashier may receive English notification.",
      "Captain may receive Arabic notification.",
      "Driver may receive Arabic or English notification.",
      "Notification templates must have translations."
    ],
    "example": {
      "en": "Order #10452 is ready.",
      "ar": "الطلب رقم 10452 جاهز."
    }
  },

  "email_sms_translation": {
    "requirements": [
      "Transactional messages should use recipient language.",
      "Order confirmation can be sent in Arabic or English.",
      "Delivery notification can be sent in Arabic or English.",
      "Password reset can be sent in Arabic or English.",
      "Marketing campaigns must have language-specific templates."
    ]
  },

  "marketing_localization": {
    "requirements": [
      "Campaign can target Arabic customers.",
      "Campaign can target English customers.",
      "Campaign can target all customers.",
      "Marketing content must support separate English and Arabic versions.",
      "Promo names can have English and Arabic versions.",
      "Customer-facing campaign messages must use selected customer language."
    ]
  },

  "kiosk_localization": {
    "requirements": [
      "Kiosk has language selector.",
      "Customer can switch between Arabic and English.",
      "Kiosk returns to configured default language after timeout.",
      "Kiosk must support RTL.",
      "Product data must display correct translation.",
      "Checkout labels must be translated."
    ]
  },

  "online_ordering_localization": {
    "requirements": [
      "Customer can select Arabic or English.",
      "Language preference may be stored in browser/session.",
      "Optional customer profile language preference.",
      "Menu content changes language.",
      "Checkout changes language.",
      "Order tracking changes language.",
      "Customer emails/messages use selected language."
    ]
  },

  "login_localization": {
    "requirements": [
      "Login page supports English.",
      "Login page supports Arabic.",
      "Language selector works before login.",
      "After successful login, user preference overrides login page language.",
      "PIN login labels support both languages.",
      "Authentication errors support both languages."
    ]
  },

  "staff_profile": {
    "new_fields": [
      "preferred_language",
      "locale",
      "timezone_optional"
    ],
    "ui": {
      "label_en": "Language",
      "label_ar": "اللغة"
    }
  },

  "manager_settings": {
    "new_section": "Language & Localization",
    "options": [
      "Restaurant default language",
      "Allowed languages",
      "Default customer-facing language",
      "Default kiosk language",
      "Default receipt language",
      "Default report language",
      "Enable Arabic",
      "Enable English"
    ]
  },

  "receipt_localization": {
    "requirements": [
      "Receipt can print in Arabic.",
      "Receipt can print in English.",
      "Receipt can print bilingual.",
      "Restaurant can configure default receipt language.",
      "Customer language may determine receipt language.",
      "Thermal receipt layout must support RTL.",
      "Arabic fonts must render correctly.",
      "Numbers and prices must remain readable."
    ],
    "receipt_modes": [
      "english",
      "arabic",
      "bilingual"
    ]
  },

  "bilingual_receipt_example": {
    "header": {
      "en": "RestaurantOS Restaurant",
      "ar": "مطعم RestaurantOS"
    },
    "item": {
      "en": "Chicken Ranch Pizza",
      "ar": "بيتزا دجاج رانش"
    },
    "total": {
      "en": "Total",
      "ar": "الإجمالي"
    }
  },

  "permissions": {
    "new_permissions": [
      "language.view",
      "language.change_self",
      "language.manage_restaurant",
      "translations.view",
      "translations.create",
      "translations.edit",
      "translations.delete",
      "translations.export"
    ],
    "rules": [
      "Every user can change their own language.",
      "Only authorized managers can change restaurant default language.",
      "Only authorized users can edit product translations.",
      "Translation administration must be audited."
    ]
  },

  "database_entities": {
    "user_extension": {
      "table": "StaffMember/User",
      "fields": [
        "preferred_language",
        "locale"
      ]
    },
    "translation_entities": [
      "MenuItemTranslation",
      "CategoryTranslation",
      "ModifierTranslation",
      "KitchenStationTranslation",
      "PromotionTranslation",
      "CampaignTranslation",
      "NotificationTemplateTranslation",
      "SystemTranslation"
    ],
    "optional": [
      "AreaTranslation",
      "TableSectionTranslation",
      "BranchTranslation"
    ]
  },

  "api": {
    "endpoints": [
      {
        "method": "GET",
        "path": "/api/me/language/",
        "purpose": "Get current user's language preference"
      },
      {
        "method": "PATCH",
        "path": "/api/me/language/",
        "purpose": "Update current user's language preference"
      },
      {
        "method": "GET",
        "path": "/api/settings/localization/",
        "purpose": "Get restaurant localization settings"
      },
      {
        "method": "PATCH",
        "path": "/api/settings/localization/",
        "purpose": "Update restaurant localization settings"
      },
      {
        "method": "GET",
        "path": "/api/translations/",
        "purpose": "Retrieve translation resources"
      },
      {
        "method": "GET",
        "path": "/api/menu/{id}/translations/",
        "purpose": "Retrieve item translations"
      },
      {
        "method": "POST",
        "path": "/api/menu/{id}/translations/",
        "purpose": "Create item translation"
      },
      {
        "method": "PATCH",
        "path": "/api/menu/{id}/translations/{translation_id}/",
        "purpose": "Update item translation"
      }
    ]
  },

  "backend_behavior": {
    "requirements": [
      "Backend API must not return translated UI labels unless the endpoint is specifically for translated content.",
      "Business entities should use stable IDs/codes.",
      "Frontend should translate UI presentation.",
      "Menu/customer-facing content may be returned according to requested locale.",
      "All validation errors must include translation keys or localized messages according to API design.",
      "Permission errors must support localization.",
      "Never use translated text as database logic keys."
    ]
  },

  "error_system": {
    "architecture": {
      "recommended": "Return stable machine-readable error codes and optionally localized messages."
    },
    "example": {
      "error_code": "CUSTOMER_PHONE_REQUIRED",
      "en": "Phone number is required.",
      "ar": "رقم الهاتف مطلوب."
    },
    "rule": "Frontend must be able to render errors in the active language."
  },

  "validation_messages": {
    "required": {
      "en": "This field is required.",
      "ar": "هذا الحقل مطلوب."
    },
    "invalid_phone": {
      "en": "Please enter a valid phone number.",
      "ar": "يرجى إدخال رقم هاتف صحيح."
    },
    "invalid_email": {
      "en": "Please enter a valid email address.",
      "ar": "يرجى إدخال بريد إلكتروني صحيح."
    },
    "generic_error": {
      "en": "Something went wrong.",
      "ar": "حدث خطأ ما."
    }
  },

  "search_localization": {
    "requirements": [
      "Customer search must work regardless of UI language.",
      "Phone searches remain numeric and language independent.",
      "Names are never transliterated automatically.",
      "Menu search can optionally search both Arabic and English item names.",
      "Category search can search both languages.",
      "Search relevance should prioritize exact matches."
    ],
    "example": {
      "arabic_user": "Can search for بيتزا",
      "english_user": "Can search for Pizza",
      "both_can_find_same_item": true
    }
  },

  "menu_search": {
    "advanced_behavior": [
      "Search English name.",
      "Search Arabic name.",
      "Search SKU.",
      "Search barcode.",
      "Search aliases where configured.",
      "Do not duplicate products because of translation."
    ]
  },

  "analytics_localization": {
    "requirements": [
      "Metric names translated.",
      "Chart labels translated.",
      "Date range selectors translated.",
      "Filter names translated.",
      "Export column names translated.",
      "Business calculations remain identical regardless of language.",
      "Language must never change the underlying metric."
    ]
  },

  "report_templates": {
    "required": [
      "Daily sales report",
      "Monthly sales report",
      "Food cost report",
      "Inventory report",
      "Delivery report",
      "Staff report",
      "Customer report",
      "Profitability report",
      "Daily closing report",
      "Executive summary"
    ],
    "languages": [
      "en",
      "ar"
    ]
  },

  "audit_logs": {
    "requirements": [
      "Store stable system action codes.",
      "Do not store only translated descriptions.",
      "Audit log UI displays action in user's selected language.",
      "Allow manager to switch audit log display language."
    ],
    "example": {
      "action_code": "ORDER_REFUNDED",
      "en": "Order refunded",
      "ar": "تم رد مبلغ الطلب"
    }
  },

  "rtl_ui_rules": {
    "POS": [
      "Support mirrored layout.",
      "Cart can move logically to RTL side.",
      "Numeric keypad remains intuitive.",
      "Price alignment remains consistent.",
      "Product cards remain readable."
    ],
    "dashboard": [
      "Cards mirror logically.",
      "Charts remain readable.",
      "Navigation mirrors appropriately."
    ],
    "tables": [
      "Table map should NOT blindly mirror actual physical restaurant layout.",
      "Manager may configure a physical floor orientation independent of UI text direction."
    ],
    "delivery": [
      "Address fields align correctly.",
      "Driver actions remain easy to use."
    ]
  },

  "important_physical_layout_rule": {
    "description": "RTL must not automatically reverse real-world spatial data.",
    "example": "If a restaurant floor plan has Table 12 physically on the left side, switching interface language to Arabic must not move Table 12 to the right side.",
    "rule": "Separate UI direction from spatial coordinate systems."
  },

  "user_experience": {
    "language_switch": {
      "target": "Instant",
      "preserve_current_page": true,
      "preserve_form_data": true,
      "preserve_cart": true,
      "preserve_selected_table": true
    },
    "example": [
      "Cashier is creating an order.",
      "Cashier switches English to Arabic.",
      "Current order remains intact.",
      "Current customer remains selected.",
      "Cart remains unchanged.",
      "Only presentation language changes."
    ]
  },

  "mixed_language_data": {
    "allowed": true,
    "examples": [
      "Customer name in Arabic while employee uses English.",
      "Customer address entered in Arabic while cashier uses English.",
      "Product has both Arabic and English names.",
      "Internal note may contain Arabic or English.",
      "Phone numbers remain numeric."
    ],
    "rule": "Never force user-entered business data into the interface language."
  },

  "fallback_strategy": {
    "priority": [
      "Requested locale translation",
      "Restaurant default locale",
      "English fallback",
      "Stable technical label"
    ],
    "rule": "Never show undefined translation keys to normal users."
  },

  "missing_translation_behavior": {
    "frontend": {
      "normal_user": "Display configured fallback language.",
      "manager": "Optionally show translation completion warning."
    },
    "admin": {
      "show_missing_translations": true
    }
  },

  "translation_management": {
    "manager_page": "/translations",
    "features": [
      "Translation dashboard",
      "Search translation key",
      "Search menu item",
      "Filter missing Arabic",
      "Filter missing English",
      "Edit Arabic translation",
      "Edit English translation",
      "Bulk translation import",
      "Bulk translation export",
      "Translation completion percentage",
      "Translation validation"
    ]
  },

  "translation_quality_controls": {
    "requirements": [
      "Detect empty translations.",
      "Detect duplicate translation keys.",
      "Detect missing translation keys.",
      "Detect placeholder mismatch.",
      "Detect interpolation mismatch.",
      "Detect unsupported locale.",
      "Validate JSON translation files."
    ],
    "placeholder_example": {
      "en": "Order {{orderNumber}} is ready.",
      "ar": "الطلب {{orderNumber}} جاهز."
    },
    "rule": "Both languages must contain all required variables."
  },

  "pluralization": {
    "requirements": [
      "Use proper i18n plural rules.",
      "Do not manually concatenate numeric values with English-only strings.",
      "Arabic pluralization must use locale-aware rules."
    ],
    "example": {
      "en": {
        "one": "{{count}} item",
        "other": "{{count}} items"
      },
      "ar": {
        "zero": "لا توجد عناصر",
        "one": "عنصر واحد",
        "two": "عنصران",
        "few": "{{count}} عناصر",
        "many": "{{count}} عنصرًا",
        "other": "{{count}} عنصر"
      }
    }
  },

  "accessibility": {
    "requirements": [
      "Language selector must have accessible labels.",
      "RTL/LTR switching must preserve keyboard accessibility.",
      "Screen reader language metadata must update.",
      "HTML lang attribute must update.",
      "dir attribute must update.",
      "Focus must remain logical after language switching."
    ]
  },

  "SEO_for_public_pages": {
    "if_public_site_enabled": true,
    "requirements": [
      "English URLs/pages.",
      "Arabic localized pages.",
      "hreflang support.",
      "Localized page titles.",
      "Localized meta descriptions.",
      "Canonical URLs.",
      "Language-specific sitemap support."
    ]
  },

  "performance": {
    "requirements": [
      "Lazy-load locale resources.",
      "Do not load every language module unnecessarily.",
      "Cache translation resources.",
      "Avoid repeated translation API calls.",
      "Keep language switching instant.",
      "Do not reload entire application unless technically required."
    ]
  },

  "security": {
    "requirements": [
      "Language settings must not bypass authorization.",
      "Translation management requires permission.",
      "Do not execute HTML from translations.",
      "Escape user-provided translation content appropriately.",
      "Prevent XSS in translated content.",
      "Sanitize rich text if menu descriptions support HTML."
    ]
  },

  "testing": {
    "unit_tests": [
      "Language preference save",
      "Language preference retrieval",
      "English loading",
      "Arabic loading",
      "Fallback behavior",
      "Pluralization",
      "Interpolation",
      "Date formatting",
      "Currency formatting",
      "Number formatting"
    ],
    "integration_tests": [
      "User A Arabic + User B English simultaneously",
      "Language persistence",
      "POS Arabic",
      "POS English",
      "KDS Arabic",
      "KDS English",
      "Delivery Arabic",
      "Delivery English",
      "Reports Arabic",
      "Reports English",
      "Kiosk Arabic",
      "Kiosk English",
      "Customer search from Arabic",
      "Customer search from English",
      "Menu translated search",
      "Translation permission enforcement"
    ],
    "e2e_tests": [
      "Login in English",
      "Switch to Arabic",
      "Create order",
      "Switch back to English",
      "Order remains intact",
      "Logout",
      "Login again",
      "Preferred language restored"
    ]
  },

  "seed_data": {
    "languages": [
      {
        "code": "en",
        "name": "English",
        "native_name": "English",
        "direction": "ltr"
      },
      {
        "code": "ar",
        "name": "Arabic",
        "native_name": "العربية",
        "direction": "rtl"
      }
    ],
    "sample_products": [
      {
        "sku": "PIZZA-RANCH",
        "translations": {
          "en": {
            "name": "Chicken Ranch Pizza",
            "description": "Chicken pizza with ranch sauce."
          },
          "ar": {
            "name": "بيتزا دجاج رانش",
            "description": "بيتزا دجاج مع صوص الرانش."
          }
        }
      },
      {
        "sku": "PIZZA-BBQ",
        "translations": {
          "en": {
            "name": "Chicken BBQ Pizza",
            "description": "Chicken pizza with BBQ sauce."
          },
          "ar": {
            "name": "بيتزا دجاج باربكيو",
            "description": "بيتزا دجاج مع صوص الباربكيو."
          }
        }
      }
    ]
  },

  "developer_implementation_rules": [
    "Do not hardcode English UI text.",
    "Do not hardcode Arabic UI text.",
    "Do not create separate Arabic and English applications.",
    "Use one application with locale switching.",
    "Keep business logic language-independent.",
    "Keep database identifiers language-independent.",
    "Store translations separately from core business entities where necessary.",
    "Use stable enums/codes for order and payment status.",
    "Do not use translated strings in conditional logic.",
    "Use translation keys everywhere.",
    "Use locale-aware formatting.",
    "Use proper RTL support.",
    "Do not mirror physical restaurant floor coordinates.",
    "Do not translate customer-entered personal data automatically.",
    "Ensure every new feature added in the future follows the same multilingual architecture."
  ],

  "future_feature_rule": {
    "description": "Every future RestaurantOS module must be multilingual by default.",
    "required_for_new_feature": [
      "English translation",
      "Arabic translation",
      "RTL support",
      "Localized validation",
      "Localized notifications",
      "Localized reports",
      "Localized customer-facing content where applicable"
    ]
  },

  "implementation_phases": {
    "phase_1": [
      "Create i18n architecture",
      "Create language resources",
      "Add user preferred_language",
      "Add language selector",
      "Add RTL/LTR switching"
    ],
    "phase_2": [
      "Translate authentication",
      "Translate dashboard",
      "Translate navigation",
      "Translate common components",
      "Translate error messages"
    ],
    "phase_3": [
      "Translate POS",
      "Translate Orders",
      "Translate Tables",
      "Translate KDS",
      "Translate Delivery"
    ],
    "phase_4": [
      "Add menu translation models",
      "Add Arabic and English product names",
      "Add category translations",
      "Add modifier translations"
    ],
    "phase_5": [
      "Translate CRM",
      "Translate Inventory",
      "Translate Reports",
      "Translate Staff",
      "Translate Settings"
    ],
    "phase_6": [
      "Translate Kiosk",
      "Translate Online Ordering",
      "Translate notifications",
      "Translate receipts"
    ],
    "phase_7": [
      "Translation management",
      "Missing translation detection",
      "Bulk import/export",
      "Translation validation"
    ],
    "phase_8": [
      "Full RTL testing",
      "Accessibility testing",
      "Performance optimization",
      "E2E testing"
    ]
  },

  "acceptance_criteria": [
    "Every user can select English or Arabic.",
    "Users can have different languages simultaneously.",
    "User language persists after logout.",
    "Restaurant can configure default language.",
    "Arabic automatically activates RTL.",
    "English automatically activates LTR.",
    "All existing modules support both languages.",
    "POS works fully in Arabic.",
    "POS works fully in English.",
    "KDS works fully in Arabic.",
    "KDS works fully in English.",
    "Delivery works fully in Arabic.",
    "Delivery works fully in English.",
    "Reports work in Arabic.",
    "Reports work in English.",
    "Customers can use Arabic or English in public ordering.",
    "Menu items can have Arabic and English names.",
    "Search can find products in both languages.",
    "Receipt can be Arabic, English or bilingual.",
    "Notifications use recipient language.",
    "No business logic depends on translated strings.",
    "No physical table layout is reversed because of RTL.",
    "No user-entered customer data is automatically corrupted by translation.",
    "Missing translations use a safe fallback.",
    "Translation administration is permission-controlled.",
    "All future features follow multilingual architecture."
  ],

  "final_engineering_instruction": {
    "role": "Senior production engineer",
    "instruction": "Implement a real multilingual architecture, not a superficial language toggle.",
    "must_be_end_to_end": [
      "Database",
      "Backend",
      "API",
      "Permissions",
      "Frontend",
      "i18n",
      "RTL",
      "Reports",
      "Notifications",
      "Receipts",
      "Testing",
      "Documentation"
    ],
    "quality_requirements": [
      "Production ready",
      "Scalable",
      "Maintainable",
      "Accessible",
      "Secure",
      "Fast",
      "Backward compatible"
    ],
    "final_deliverable": "Return all modified and newly created files with exact paths, complete implementation, migrations, translation files, test files, setup instructions and documentation. Do not provide pseudo-code for core functionality."
  }
}
```
