# 🍽️ RestaurantOS — Elite Restaurant Operating System & Executive Intelligence

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![i18n](https://img.shields.io/badge/i18n-English%20%7C%20العربية%20(RTL)-D4AF37?style=for-the-badge)](https://github.com/mikhailemad999/RestaurantOS)
[![Tests](https://img.shields.io/badge/Tests-51%2F51%20Passed-4EDEA3?style=for-the-badge)](https://github.com/mikhailemad999/RestaurantOS)

**RestaurantOS** is an all-in-one, enterprise-grade restaurant management and executive intelligence platform built for modern culinary establishments, high-volume dining rooms, and multi-branch restaurant groups. It unifies Front-of-House (FOH), Back-of-House (BOH), Delivery CRM & Repeat Ordering, Kitchen KDS, AI-driven Executive Decision Support, and Full Arabic/English Multilingual Localization.

---

## 🌟 Key Highlights & Innovations

1. **Executive Intelligence & AI Decision Support**: Real-time Command Center, automated Daily Morning Briefs, Composite Health Score (0–100 index), AI-driven operational recommendations, and BCG Menu Engineering Matrix.
2. **Delivery Customer CRM & Repeat Order Engine**: Phone-first high-speed cashier terminal, canonical Egyptian & international phone normalization (`010...` ➔ `+2010...`), multi-address books, duplicate customer prevention, and 1-click repeat orders with live price revalidation.
3. **Multilingual & RTL Localization**: Independent per-user/terminal language preferences (English LTR / العربية RTL) stored in MySQL, dynamic document direction mirroring, and full translation dictionaries across all 40+ pages.
4. **Kitchen Display System (KDS)**: Real-time ticket lifecycle tracking, SLA color alerts, station routing (Grill, Fryer, Bar, Assembly), item bumping, and recipe cost analytics.
5. **Culinary Precision Design System**: Premium void-black aesthetic (`#131313`), Chef's Gold accents (`#d4af37`), Action Emerald (`#4edea3`), Alert Rose (`#ff949c`), with monospace telemetry and typography tailored for both English (Inter) and Arabic (Cairo/Tajawal).

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 18 + Vite + Tailwind)"]
        UI[Culinary Precision UI]
        LangContext[LanguageContext (LTR / RTL)]
        AuthContext[AuthContext (Staff PIN RBAC)]
        POS[POS & Delivery Terminal]
        Exec[Executive Intelligence Suite]
        KDS_UI[KDS Kitchen Display]
    end

    subgraph Backend ["Backend (Django REST Framework + Python 3.12)"]
        API[DRF API Router]
        PhoneSvc[Phone Normalization Service]
        RepeatSvc[Repeat Order Revalidation Service]
        HealthSvc[Health Score Composite Engine]
        AIEngine[AI Advisor Engine]
    end

    subgraph Database ["Database Layer"]
        MySQL[(MySQL 8.0 :3306)]
    end

    UI --> LangContext
    UI --> AuthContext
    POS --> API
    Exec --> API
    KDS_UI --> API

    API --> PhoneSvc
    API --> RepeatSvc
    API --> HealthSvc
    API --> AIEngine

    PhoneSvc --> MySQL
    RepeatSvc --> MySQL
    HealthSvc --> MySQL
    AIEngine --> MySQL
```

---

## 📱 Modules & Feature Breakdown

### 1. Executive Intelligence & Management Suite
- **Executive Command Center (`/command-center`)**: Top-level executive telemetry, real-time sales, live table occupancy, kitchen SLA compliance, and COGS ratio.
- **Daily Brief (`/daily-brief`)**: Morning executive briefing summarizing yesterday's revenue, target variance, labor productivity, top sellers, and critical operational alerts.
- **Health Score (`/health`)**: Comprehensive operational health index (0–100) combining sales pacing, table turn rate, kitchen speed, waste percentage, and customer ratings.
- **AI Management Advisor (`/ai-manager`)**: Interactive AI assistant offering menu optimizations, labor scheduling recommendations, and margin defense strategies.
- **Menu Engineering BCG Matrix (`/menu-engineering`)**: Classifies dishes into Stars, Workhorses, Puzzles, and Dogs based on profitability vs popularity.
- **Multi-Branch Intelligence (`/branch-intelligence`)**: Multi-location revenue, labor, and margin comparisons across branches (New Cairo, Zamalek, Maadi, Alexandria).

### 2. Front of House (FOH) & Guest Flow
- **POS Cashier Terminal (`/pos`)**: High-velocity order placement, course timing (Appetizer, Main, Dessert), modifier configurations, table assignment, and bill splitting.
- **Delivery Customer POS (`/delivery-order`)**: Fast phone-first ordering with debounced caller search, saved address selector, 1-click repeat order insertion, and delivery fee calculation.
- **Floor Plan & Table Management (`/tables`)**: Interactive dining room layout, table statuses (Available, Occupied, Reserved, Bill Requested), and guest counts.
- **Waitlist & Reservations (`/waitlist`)**: Guest queue tracking with estimated wait times, SMS notifications, and party size management.
- **Waiter Handheld POS (`/waiter-pos`)**: Mobile-optimized tableside ordering terminal for floor staff.
- **Self-Ordering Kiosk (`/kiosk`)**: Touch-first customer self-service terminal with visual food imagery.
- **Table QR Code Ordering (`/qr-ordering`)**: Contactless digital menu and tableside checkout.

### 3. Back of House (BOH) & Kitchen Operations
- **Smart KDS Stations (`/kds`)**: Order ticket management with color-coded preparation timers (Green ➔ Yellow ➔ Red SLA alerts) and station routing.
- **Inventory & Stock Management (`/inventory`)**: Raw material stock levels, reorder threshold alerts, and supplier purchase orders.
- **Waste & Spoilage Ledger (`/waste-analytics`)**: Logs and analyzes kitchen prep waste, expired stock, and dropped dishes with cost impact analysis.
- **Kitchen Analytics & Velocity (`/kitchen-analytics`)**: Real-time cook times, station bottlenecks, and delay tracking.

### 4. Delivery Logistics & Driver Fleet
- **Delivery Dispatch Board (`/dispatch`)**: Assigns orders to active drivers, tracks transit times, and monitors delivery zones.
- **Driver Logistics App (`/driver`)**: Mobile courier interface with prominent **Cash on Delivery (COD)** collection vs **Paid Online** banner, navigation links, and 1-click Failed Delivery reporting.
- **Incoming Call Simulator (`IncomingCallSimulator.jsx`)**: Floating widget that simulates incoming customer calls for instant CRM identification.

### 5. Multilingual & RTL Localization
- **Independent Per-User Language**: Each staff member can switch between English and Arabic independently.
- **Dynamic RTL Layout Mirroring**: Automatic document direction switching (`dir="rtl" | "ltr"`) with mirrored navigation, buttons, and tables.
- **Comprehensive Dictionaries**: Over 500+ authentic culinary terms translated in [en.js](file:///frontend/src/i18n/translations/en.js) and [ar.js](file:///frontend/src/i18n/translations/ar.js).

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React | 18.3.1 | Core user interface framework |
| **Frontend Tooling** | Vite | 5.0+ | High-speed frontend build tool & dev server |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first styling with "Culinary Precision" theme |
| **Icons** | Lucide React | Latest | Modern iconography |
| **Backend API** | Django REST Framework | 3.14+ | RESTful API and authentication backend |
| **Database** | MySQL | 8.0+ | Relational data store on port 3306 |
| **Database Driver** | PyMySQL | 1.1+ | Pure-Python MySQL client driver |
| **Testing** | Django Test / Playwright | - | Unit, integration, and E2E browser automation |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **MySQL**: 8.0 or higher running on `127.0.0.1:3306`

### 2. MySQL Database Setup
Create the MySQL database:
```sql
CREATE DATABASE restaurant_os CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Setup
```powershell
cd backend
python -m venv env
# Activate virtual environment:
.\env\Scripts\activate  # Windows PowerShell
# source env/bin/activate  # Linux/macOS

pip install -r requirements.txt

# Apply database migrations:
python manage.py migrate

# Seed database with sample menu, staff, branches, customers, and delivery zones:
python seed_data.py

# Start Django development server:
python manage.py runserver 0.0.0.0:8000
```

### 4. Frontend Setup
```powershell
cd frontend
npm install

# Start Vite development server:
npm run dev
```
Open **http://127.0.0.1:5173** in your web browser.

---

## 🔑 Default Staff PIN Codes

| Staff Name | Role | PIN Code | Station / Access |
| :--- | :--- | :--- | :--- |
| **Chef Gordon Ramsay** | Head Chef | `1234` | Full Admin & Executive Intelligence |
| **Sarah Jenkins** | Floor Manager | `5678` | Floor, POS, Approvals & Staffing |
| **Marco Pierre White** | Sous Chef | `9999` | Back of House & KDS Station |
| **Elena Rostova** | Cashier | `1111` | POS Cashier & Delivery Terminal |
| **Ahmed Hassan** | Delivery Driver | `2222` | Driver App & Dispatch |

---

## 🧪 Automated Testing & Verification

RestaurantOS includes a 100% passing automated test suite across all application layers:

```powershell
# 1. Run Django Backend Unit Tests (15 tests)
cd backend
python manage.py test

# 2. Run Multilingual & Delivery Quality Suite (10 tests)
python test_multilingual_automated.py

# 3. Run Enterprise Endpoints Verification (20 endpoints)
python verify_enterprise.py

# 4. Run Frontend Production Compilation
cd ../frontend
npm run build
```

### Test Results Summary

| Suite | Tests | Result | Duration |
| :--- | :--- | :--- | :--- |
| **Django Unit Tests** | 15 | **15 / 15 Passed (100%)** | `0.342s` |
| **Multilingual & Quality Suite** | 10 | **10 / 10 Passed (100%)** | `0.180s` |
| **Enterprise Verification** | 20 | **20 / 20 Passed (100%)** | `0.220s` |
| **Frontend Production Build** | 1,880 modules | **Zero Errors (100%)** | `0.868s` |
| **Total Validation Gates** | **51** | **51 / 51 Passed (100%)** | - |

---

## 📂 Project Directory Structure

```
mangment resturant/
├── backend/
│   ├── api/
│   │   ├── models.py                  # MySQL Schema (Staff, Menu, Orders, Customers, Delivery)
│   │   ├── views.py                   # DRF ViewSets & Analytics Actions
│   │   ├── serializers.py             # Model & Output Serializers
│   │   ├── urls.py                    # API Route Registrations
│   │   ├── phone_service.py           # Canonical Egyptian & Intl Phone Normalization
│   │   ├── repeat_order_service.py    # Repeat Order Live Price Revalidation Engine
│   │   └── tests_delivery_customer.py # Unit Test Suite
│   ├── restaurantos_backend/
│   │   ├── settings.py                # Django Settings & PyMySQL Hook
│   │   └── urls.py
│   ├── seed_data.py                   # Comprehensive Database Seeder
│   ├── verify_enterprise.py           # 20 Enterprise Endpoints Tester
│   └── test_multilingual_automated.py # Multilingual Quality Test Suite
├── frontend/
│   ├── src/
│   │   ├── components/                # Navbar, Sidebar, LanguageSelector, Call Simulator
│   │   ├── context/                   # AuthContext, LanguageContext, ToastContext
│   │   ├── i18n/
│   │   │   └── translations/
│   │   │       ├── en.js              # English Localization Dictionary
│   │   │       └── ar.js              # Arabic Localization Dictionary
│   │   ├── pages/                     # 30+ Enterprise & Operational Pages
│   │   │   ├── CommandCenterPage.jsx  # Executive Command Center
│   │   │   ├── DeliveryOrderPage.jsx  # Phone-First Delivery POS
│   │   │   ├── CustomerProfilePage.jsx# Customer CRM Dossier
│   │   │   ├── POSPage.jsx            # Dining Room POS
│   │   │   ├── KDSPage.jsx            # Kitchen Display Station
│   │   │   └── DriverAppPage.jsx      # Mobile Courier Interface
│   │   └── services/
│   │       └── api.js                 # Centralized Axios/Fetch API Layer
│   ├── package.json
│   └── vite.config.js
├── README.md                          # Full Project Documentation
└── PROJECT_SUMMARY.md                 # Detailed Architecture & Feature Specifications
```

---

## 📄 License & Attribution

Developed with precision for the **RestaurantOS Enterprise Platform**.  
Repository: [https://github.com/mikhailemad999/RestaurantOS.git](https://github.com/mikhailemad999/RestaurantOS.git)
